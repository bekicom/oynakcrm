const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: String,
    last_name: String,
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: { type: String, required: true }, // 🔐 qo‘shildi
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
