const { _success, _moment, inviteUrl } = require("../../helpers/common");
const { apiInternalServerError, apiNotFound, apiBadRequest } = require("../../exceptions/apiErrors");
const { uniqueWorkspaceCode } = require("../../helpers/slug");
const Invite = require("../../models/invites");

const toInviteResult = (invite) => ({
  ...invite.toObject(),
  url: inviteUrl(invite.token),
});

const create = async (req, res) => {
  try {
    const guestName = String(req.body.name || "").trim();
    const hostName = String(req.body.host_name || req.user?.name || "").trim();
    if (!guestName) {
      return apiBadRequest(res, "Guest name is required");
    }
    if (!hostName) {
      return apiBadRequest(res, "Your name is required");
    }

    const token = await uniqueWorkspaceCode((code) => Invite.findOne({ token: code }).exec());
    const result = await Invite.create({
      token,
      guest_name: guestName,
      host_name: hostName,
      created_by: req.user._id,
    });
    return _success(res, "Invite created", toInviteResult(result));
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const latest = async (req, res) => {
  try {
    const invite = await Invite.findOne().sort({ created_at: -1 }).exec();
    if (!invite) {
      return _success(res, "No invite yet", null);
    }
    return _success(res, "Invite retrieved", toInviteResult(invite));
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const show = async (req, res) => {
  try {
    const result = await Invite.findById(req.params.id).exec();
    if (!result) return apiNotFound(res, "Invite not found");
    return _success(res, "Invite retrieved", toInviteResult(result));
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const destroy = async (req, res) => {
  try {
    const result = await Invite.findByIdAndUpdate(
      req.params.id,
      { deleted_at: _moment() },
      { new: true }
    );
    if (!result) return apiNotFound(res, "Invite not found");
    return _success(res, "Invite deleted", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

module.exports = {
  create,
  latest,
  show,
  destroy,
};
