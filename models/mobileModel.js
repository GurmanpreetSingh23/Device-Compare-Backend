const mongoose = require("mongoose");

const mobileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specs: [{ type: String }],
    betterFor: { type: String },
    image: {
      type: String,
      default: "",
    },
    price: { type: String },
    buyLinks: [
      {
        site: { type: String },
        url: { type: String },
      },
    ],
    betterFor: { type: String, default: "Balanced" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mobile", mobileSchema);
