const mongoose = require("mongoose");
const { _success } = require("../../helpers/common");
const {
  apiInternalServerError,
  apiForbidden,
  apiNotFound,
} = require("../../exceptions/apiErrors");
const Channel = require("../../models/channels");
const Invite = require("../../models/invites");
const { getAccessibleChannel } = require("../../helpers/channelAccess");

const list = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const match =
      req.user.role === "admin"
        ? { deleted_at: null }
        : { deleted_at: null, users: req.user._id };

    const result = await Channel.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "chats",
          let: { channelId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$channel_id", "$$channelId"] },
                deleted_at: null,
              },
            },
            { $sort: { created_at: -1 } },
            { $limit: 1 },
            { $project: { body: 1, created_at: 1, sender_id: 1, files: 1 } },
          ],
          as: "last_message",
        },
      },
      { $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "guest_id",
          foreignField: "_id",
          as: "guest",
        },
      },
      { $unwind: { path: "$guest", preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          last_read_at: {
            $let: {
              vars: {
                mine: {
                  $first: {
                    $filter: {
                      input: { $ifNull: ["$reads", []] },
                      as: "read",
                      cond: { $eq: ["$$read.user_id", userId] },
                    },
                  },
                },
              },
              in: "$$mine.last_read_at",
            },
          },
        },
      },
      {
        $lookup: {
          from: "chats",
          let: { channelId: "$_id", lastRead: "$last_read_at" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$channel_id", "$$channelId"] },
                    { $eq: [{ $ifNull: ["$deleted_at", null] }, null] },
                    { $ne: ["$sender_id", userId] },
                    {
                      $gt: [
                        "$created_at",
                        { $ifNull: ["$$lastRead", new Date(0)] },
                      ],
                    },
                  ],
                },
              },
            },
            { $count: "count" },
          ],
          as: "unread",
        },
      },
      {
        $addFields: {
          unread_count: { $ifNull: [{ $arrayElemAt: ["$unread.count", 0] }, 0] },
        },
      },
      {
        $lookup: {
          from: "invites",
          localField: "guest_id",
          foreignField: "guest_id",
          as: "invite",
        },
      },
      {
        $addFields: {
          host_name: {
            $let: {
              vars: {
                stored: { $ifNull: ["$host_name", ""] },
                invited: { $ifNull: [{ $arrayElemAt: ["$invite.host_name", 0] }, ""] },
              },
              in: {
                $cond: [{ $gt: [{ $strLenCP: "$$stored" }, 0] }, "$$stored", "$$invited"],
              },
            },
          },
        },
      },
      {
        $project: {
          name: 1,
          host_name: 1,
          created_by: 1,
          guest_id: 1,
          users: 1,
          created_at: 1,
          updated_at: 1,
          last_message: 1,
          unread_count: 1,
          guest: {
            _id: "$guest._id",
            name: "$guest.name",
          },
        },
      },
      {
        $sort: {
          unread_count: -1,
          "last_message.created_at": -1,
          updated_at: -1,
        },
      },
    ]);

    return _success(res, "Channels retrieved", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const show = async (req, res) => {
  try {
    const channel = await getAccessibleChannel(req.params.id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const result = await Channel.findById(channel._id)
      .populate("guest_id", "name")
      .populate("users", "name role")
      .exec();

    if (!result) return apiNotFound(res, "Channel not found");

    if (!result.host_name) {
      const invite = await Invite.findOne({ guest_id: result.guest_id }).exec();
      if (invite?.host_name) {
        result.host_name = invite.host_name;
      }
    }
    return _success(res, "Channel retrieved", result);
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

const markRead = async (req, res) => {
  try {
    const channel = await getAccessibleChannel(req.params.id, req.user);
    if (!channel) return apiForbidden(res, "You cannot access this channel");

    const now = new Date();
    const updated = await Channel.findOneAndUpdate(
      { _id: channel._id, "reads.user_id": req.user._id },
      { $set: { "reads.$.last_read_at": now } },
      { new: true }
    ).exec();

    if (!updated) {
      await Channel.findByIdAndUpdate(channel._id, {
        $push: { reads: { user_id: req.user._id, last_read_at: now } },
      }).exec();
    }

    const io = req.app.get("io");
    io?.to(`user:${req.user._id}`).emit("channel:read", {
      channel_id: String(channel._id),
    });

    return _success(res, "Channel marked read", { unread_count: 0 });
  } catch (error) {
    return apiInternalServerError(res, error.message);
  }
};

module.exports = {
  list,
  show,
  markRead,
};
