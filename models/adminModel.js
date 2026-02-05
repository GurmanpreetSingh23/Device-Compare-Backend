const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema(
  {
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ["Mobile", "Laptop"], required: true },
  },
  { _id: false }
);

const adminSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    isAdmin: { type: Boolean, default: false },
    favorites: [favoriteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
