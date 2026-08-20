const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;
const { toPublicFileUrl } = require("../helpers/common");

const chatSchema = new mongoose.Schema(
  {
    body: { type: String, default: "", index: 1 },
    channel_id: {
      type: ObjectId,
      ref: "channels",
      required: true,
      index: 1,
    },
    sender_id: { type: ObjectId, ref: "users", required: true, index: 1 },
    parent_chat_id: {
      type: ObjectId,
      ref: "chats",
      required: false,
      index: 1,
      default: null,
    },
    reactions: [
      {
        user_id: { type: ObjectId, ref: "users", required: true },
        emoji: { type: String, required: true },
      },
    ],
    files: { type: [String], required: false, default: [] },
    deleted_at: { type: Date, default: null, index: 1 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

chatSchema.pre(["find", "findOne", "findById", "findByIdAndUpdate"], function () {
  this.where({ deleted_at: null });
});

chatSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

const withPublicFiles = (ret) => {
  if (Array.isArray(ret.files)) {
    ret.files = ret.files.map((file) => toPublicFileUrl(file));
  }
  return ret;
};

chatSchema.set("toJSON", {
  transform: (_doc, ret) => withPublicFiles(ret),
});

chatSchema.set("toObject", {
  transform: (_doc, ret) => withPublicFiles(ret),
});

module.exports = mongoose.model("chats", chatSchema);
