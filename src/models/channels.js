const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const channelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: 1 },
    host_name: { type: String, default: "" },
    created_by: { type: ObjectId, ref: "users", required: true, index: 1 },
    guest_id: { type: ObjectId, ref: "users", required: true, unique: true, index: 1 },
    users: {
      type: [{ type: ObjectId, ref: "users", required: true }],
      required: true,
      default: [],
    },
    reads: {
      type: [
        {
          user_id: { type: ObjectId, ref: "users", required: true },
          last_read_at: { type: Date, required: true },
        },
      ],
      default: [],
    },
    deleted_at: { type: Date, default: null, index: 1 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

channelSchema.pre(["find", "findOne", "findById", "findByIdAndUpdate"], function () {
  this.where({ deleted_at: null });
});

channelSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

module.exports = mongoose.model("channels", channelSchema);
