const mongoose = require("mongoose");

const laptopSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },

    processor_brand: { type: String, default: "Unknown" },
    processor_name: { type: String, default: "Unknown" },
    processor_gnrtn: { type: String, default: "Unknown" },

    ram_gb: { type: String, default: "Unknown" },
    ram_type: { type: String, default: "Unknown" },

    ssd: {
      type: String,
      default: "No SSD",
      set: (v) => (parseInt(v) > 0 ? `${v}` : "No SSD"),
    },

    hdd: {
      type: String,
      default: "No HDD",
      set: (v) => (parseInt(v) > 0 ? `${v}` : "No HDD"),
    },

    os: { type: String, default: "Unknown" },
    os_bit: { type: String, default: "Unknown" },

    graphic_card_gb: { type: String, default: "Integrated" },
    weight: { type: String, default: "Unknown" },
    display_size: { type: String, default: "Unknown" },
    warranty: { type: String, default: "0" },

    Touchscreen: { type: String, enum: ["Yes", "No"], default: "No" },
    msoffice: { type: String, enum: ["Yes", "No"], default: "No" },

    latest_price: { type: Number, required: true },
    old_price: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    star_rating: { type: Number, default: 0 },
    ratings: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },

    image: { type: String, default: "" },

    buyLinks: [
      {
        site: { type: String },
        url: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Laptop", laptopSchema);
