const bcrypt = require("bcrypt");
const { _success, _unprocessable } = require("../../helpers/common");
const {
  apiInternalServerError,
  apiNotFound,
  apiBadRequest,
} = require("../../exceptions/apiErrors");
const { signToken } = require("../../helpers/authToken");
const Invite = require("../../models/invites");
const User = require("../../models/user");
const Channel = require("../../models/channels");

const isInviteActive = (invite) => {
  if (!invite) return false;
  if (invite.expires_at && new Date(invite.expires_at) < new Date()) return false;
  return true;
};

const preview = async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token })
      .populate("created_by", "name")
      .exec();

    if (!isInviteActive(invite)) {
      return apiNotFound(res, "Invite is invalid or expired");
    }

    return _success(res, "Invite is valid", {
      host_name: invite.host_name || invite.created_by?.name || "",
      guest_name: invite.guest_name || "",
    });
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const findOrCreateGuest = async ({ invite, name, passwordHash }) => {
  if (invite.guest_id) {
    const existing = await User.findById(invite.guest_id).exec();
    if (existing) {
      existing.name = name;
      if (passwordHash) existing.password = passwordHash;
      existing.status = "active";
      await existing.save();
      return existing;
    }
  }

  const guest = await User.create({
    name,
    password: passwordHash,
    role: "guest",
    status: "active",
  });
  invite.guest_id = guest._id;
  await invite.save();
  return guest;
};

const join = async (req, res) => {
  try {
    const invite = await Invite.findOne({ token: req.params.token }).exec();
    if (!isInviteActive(invite)) {
      return apiNotFound(res, "Invite is invalid or expired");
    }

    const name = String(req.body.name || invite.guest_name || "").trim();
    const password = String(req.body.password || "");

    if (!name) {
      return apiBadRequest(res, "Name is required");
    }
    if (password.length < 6) {
      return apiBadRequest(res, "Password must be at least 6 characters");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let guest;
    try {
      guest = await findOrCreateGuest({ invite, name, passwordHash });
    } catch (error) {
      if (error.statusCode === 422) {
        return _unprocessable(res, error.message);
      }
      throw error;
    }

    const hostName = String(invite.host_name || "").trim();

    let channel = await Channel.findOne({ guest_id: guest._id }).exec();
    let created = false;
    if (!channel) {
      channel = await Channel.create({
        name: guest.name,
        host_name: hostName,
        created_by: invite.created_by,
        guest_id: guest._id,
        users: [invite.created_by, guest._id],
      });
      created = true;
    } else {
      let dirty = false;
      if (channel.name !== guest.name) {
        channel.name = guest.name;
        dirty = true;
      }
      if (hostName && channel.host_name !== hostName) {
        channel.host_name = hostName;
        dirty = true;
      }
      if (dirty) {
        await channel.save();
      }
    }

    if (created) {
      const io = req.app.get("io");
      io?.to("admins").emit("channel:created", {
        ...channel.toObject(),
        guest: {
          _id: guest._id,
          name: guest.name,
        },
      });
    }

    const token = signToken(guest);
    return _success(res, "Joined chat", {
      token,
      user: {
        id: guest.id,
        name: guest.name,
        role: guest.role,
      },
      channel,
    });
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

module.exports = {
  preview,
  join,
};
