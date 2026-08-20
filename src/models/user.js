const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: 1 },
    email: { type: String, required: false, unique: true, sparse: true, index: 1 },
    phone: { type: String, required: false, unique: true, sparse: true, index: 1 },
    password: { type: String },
    role: { type: String, enum: ["admin", "guest"], default: "guest" },
    status: { type: String, enum: ["active", "inactive"], default: "active", index: 1 },
    deleted_at: { type: Date, default: null, index: 1 },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

userSchema.pre(["find", "findOne", "findById", "findByIdAndUpdate", "countDocuments"], function () {
  this.where({ deleted_at: null });
});

userSchema.pre("aggregate", function () {
  this.pipeline().unshift({ $match: { deleted_at: null } });
});

module.exports = mongoose.model("users", userSchema);
