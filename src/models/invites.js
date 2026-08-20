const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const inviteSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, index: 1 },
    host_name: { type: String, default: "" },
    guest_name: { type: String, required: true, index: 1 },
    guest_id: { type: ObjectId, ref: "users", default: null, index: 1 },
    created_by: { type: ObjectId, ref: "users", required: true, index: 1 },
    expires_at: { type: Date, default: null, index: 1 },
    deleted_at: { type: Date, default: null, index: 1 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

inviteSchema.pre(["find", "findOne", "findById", "findByIdAndUpdate"], function () {
  this.where({ deleted_at: null });
});

inviteSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

module.exports = mongoose.model("invites", inviteSchema);
