const toPublicMessage = (message) => {
  if (!message) return message;
  const obj = typeof message.toObject === "function" ? message.toObject() : { ...message };
  const sender = obj.sender_id;
  return {
    ...obj,
    _id: obj._id != null ? String(obj._id) : obj._id,
    channel_id: obj.channel_id != null ? String(obj.channel_id) : obj.channel_id,
    sender_id:
      sender && typeof sender === "object"
        ? {
            _id: String(sender._id),
            name: sender.name,
            role: sender.role,
          }
        : sender != null
          ? String(sender)
          : sender,
    kind: obj.kind || "message",
  };
};

const toPublicChannel = (channel, guest, extras = {}) => {
  const obj = typeof channel.toObject === "function" ? channel.toObject() : { ...channel };
  const guestDoc = guest || obj.guest;
  return {
    _id: String(obj._id),
    name: obj.name,
    host_name: obj.host_name || "",
    created_by: obj.created_by != null ? String(obj.created_by) : undefined,
    guest_id: obj.guest_id != null ? String(obj.guest_id) : undefined,
    users: (obj.users || []).map((id) => String(id)),
    created_at: obj.created_at,
    updated_at: obj.updated_at,
    guest: guestDoc
      ? { _id: String(guestDoc._id), name: guestDoc.name }
      : undefined,
    unread_count: extras.unread_count ?? 0,
    last_message: extras.last_message || obj.last_message || null,
  };
};

module.exports = {
  toPublicMessage,
  toPublicChannel,
};
