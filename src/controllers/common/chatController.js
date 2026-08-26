const { _success, _moment } = require("../../helpers/common");
const {
  apiInternalServerError,
  apiForbidden,
  apiBadRequest,
  apiNotFound,
} = require("../../exceptions/apiErrors");
const Chat = require("../../models/chats");
const Channel = require("../../models/channels");
const { getAccessibleChannel } = require("../../helpers/channelAccess");
const { toPublicMessage } = require("../../helpers/socketPayload");

const emitMessage = (req, channel, event, payload) => {
  const io = req.app.get("io");
  if (!io || !channel) return;
  const channelId = String(channel._id);
  const publicPayload = payload && payload._id ? toPublicMessage(payload) : payload;
  io.to(`channel:${channelId}`).emit(event, publicPayload);
  io.to("admins").emit("channel:updated", {
    channel_id: channelId,
    last_message: publicPayload,
  });
  if (channel.guest_id) {
    io.to(`user:${String(channel.guest_id)}`).emit("channel:updated", {
      channel_id: channelId,
      last_message: publicPayload,
    });
  }
};

const create = async (req, res) => {
  try {
    const { body, parent_chat_id } = req.body;
    const files = req.files
      ? req.files.map((file) => `storage/chat/files/${file.filename}`)
      : [];
    const text = typeof body === "string" ? body.trim() : "";

    if (!text && files.length === 0) {
      return apiBadRequest(res, "Message body or file is required");
    }

    const channel = await getAccessibleChannel(req.body.channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const result = await Chat.create({
      body: text,
      sender_id: req.user._id,
      channel_id: channel._id,
      parent_chat_id: parent_chat_id || null,
      files,
    });

    await Channel.findByIdAndUpdate(channel._id, { updated_at: _moment() });

    const populated = await Chat.findById(result._id)
      .populate("sender_id", "name role")
      .exec();

    emitMessage(req, channel, "message:created", populated);
    return _success(res, "Chat created", populated);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const list = async (req, res) => {
  try {
    const { channel_id } = req.query;
    if (!channel_id) {
      return apiBadRequest(res, "channel_id is required");
    }

    const channel = await getAccessibleChannel(channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const result = await Chat.find({ channel_id })
      .sort({ created_at: -1 })
      .limit(200)
      .populate("sender_id", "name role")
      .exec();

    return _success(res, "Chats retrieved", result.reverse());
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const canMutate = (chat, user) => {
  if (chat.kind === "system") return false;
  if (user.role === "admin") return true;
  return String(chat.sender_id) === String(user._id);
};

const update = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).exec();
    if (!chat) return apiNotFound(res, "Chat not found");

    const channel = await getAccessibleChannel(chat.channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");
    if (!canMutate(chat, req.user)) {
      return apiForbidden(res, "You cannot edit this message");
    }

    const result = await Chat.findByIdAndUpdate(
      req.params.id,
      { body: req.body.body },
      { new: true }
    )
      .populate("sender_id", "name role")
      .exec();

    emitMessage(req, channel, "message:updated", result);
    return _success(res, "Chat updated", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const destroy = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).exec();
    if (!chat) return apiNotFound(res, "Chat not found");

    const channel = await getAccessibleChannel(chat.channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");
    if (!canMutate(chat, req.user)) {
      return apiForbidden(res, "You cannot delete this message");
    }

    const result = await Chat.findByIdAndUpdate(
      req.params.id,
      { deleted_at: _moment() },
      { new: true }
    );

    emitMessage(req, channel, "message:deleted", { _id: req.params.id, channel_id: channel._id });
    return _success(res, "Chat deleted", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const addReaction = async (req, res) => {
  try {
    const { chat_id, emoji } = req.body;
    const chat = await Chat.findById(chat_id).exec();
    if (!chat) return apiNotFound(res, "Chat not found");

    const channel = await getAccessibleChannel(chat.channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const result = await Chat.findByIdAndUpdate(
      chat_id,
      { $push: { reactions: { user_id: req.user._id, emoji } } },
      { new: true }
    )
      .populate("sender_id", "name role")
      .exec();

    emitMessage(req, channel, "message:updated", result);
    return _success(res, "Reaction added", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const removeReaction = async (req, res) => {
  try {
    const { chat_id } = req.body;
    const chat = await Chat.findById(chat_id).exec();
    if (!chat) return apiNotFound(res, "Chat not found");

    const channel = await getAccessibleChannel(chat.channel_id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const result = await Chat.findByIdAndUpdate(
      chat_id,
      { $pull: { reactions: { user_id: req.user._id } } },
      { new: true }
    )
      .populate("sender_id", "name role")
      .exec();

    emitMessage(req, channel, "message:updated", result);
    return _success(res, "Reaction removed", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

module.exports = {
  create,
  list,
  update,
  destroy,
  addReaction,
  removeReaction,
};
