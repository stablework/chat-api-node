const Channel = require("../models/channels");

const getAccessibleChannel = async (channelId, user) => {
  if (!channelId || !user) return null;
  if (user.role === "admin") {
    return Channel.findById(channelId).exec();
  }
  return Channel.findOne({ _id: channelId, users: user._id }).exec();
};

module.exports = { getAccessibleChannel };
