const mobileModel = require("../models/mobileModel");
const laptopModel = require("../models/laptopModel");

module.exports.getAllProducts = async (req, res) => {
  try {
    const { type, brand, minPrice, maxPrice, limit } = req.query;

    const model = type === "laptop" ? laptopModel : mobileModel;

    const query = {};

    if (brand) {
      if (type === "mobile") {
        query.name = { $regex: brand, $options: "i" };
      }
      if (type === "laptop") {
        query.brand = { $regex: brand, $options: "i" };
      }
    }

    if (type === "laptop" && req.query.model) {
      query.model = { $regex: req.query.model, $options: "i" };
    }

    const dbLimit = Number(limit) || 300;

    console.time("finding product");

    let products = await model.find(query).limit(dbLimit).lean();

    console.timeEnd("finding product");

    if (minPrice || maxPrice) {
      const min = Number(minPrice) || 0;
      const max = Number(maxPrice) || Infinity;

      products = products.filter((p) => {
        let priceValue = 0;

        if (type === "mobile" && p.price) {
          priceValue = Number(p.price.replace(/[^0-9]/g, ""));
        }

        if (type === "laptop" && p.latest_price) {
          priceValue = p.latest_price;
        }

        return priceValue >= min && priceValue <= max;
      });
    }

    res.status(200).json(products);
  } catch (err) {
    console.error("Error in getAllProducts:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports.searchedProducts = async (req, res) => {
  try {
    const query = req.params.query;
    if (!query) {
      return res.status(400).json({ message: "Search query missing" });
    }

    const searchRegex = { $regex: query, $options: "i" };

    // mobile fields
    const mobileResults = await mobileModel.find({
      $or: [{ name: searchRegex }, { brand: searchRegex }],
    });

    // laptop fields
    const laptopResults = await laptopModel.find({
      $or: [{ model: searchRegex }, { brand: searchRegex }],
    });

    return res.status(200).json([...mobileResults, ...laptopResults]);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: err.message });
  }
};

module.exports.fetchProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    let product = await mobileModel.findById(id);

    if (product)
      return res.status(200).json({ success: true, type: "mobile", product });

    product = await laptopModel.findById(id);

    if (product)
      return res.status(200).json({ success: true, type: "laptop", product });

    return res.status(404).json({
      success: false,
      message: "Product not found in any collection",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports.fetchMobileAndUpdate = async (req, res) => {
  try {
    const { name, specs, price, buyLinks, image, betterFor } = req.body;

    if (!req.admin || !req.admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Validate
    if (!name) {
      return res.status(400).json({ message: "Mobile name is required" });
    }

    // Find and update or create if not exists
    const updatedMobile = await mobileModel.findOneAndUpdate(
      { name }, // unique field
      {
        specs,
        price,
        buyLinks,
        image,
        betterFor,
      },
      { new: true, upsert: true }, // new = return updated, upsert = create if not exists
    );

    return res.status(200).json({
      message: "Mobile updated successfully",
      data: updatedMobile,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

module.exports.fetchLaptopAndUpdate = async (req, res) => {
  try {
    const {
      brand,
      model,
      processor_brand,
      processor_name,
      processor_gnrtn,
      ram_gb,
      ram_type,
      ssd,
      hdd,
      os,
      os_bit,
      graphic_card_gb,
      weight,
      display_size,
      warranty,
      Touchscreen,
      msoffice,
      latest_price,
      old_price,
      discount,
      star_rating,
      ratings,
      reviews,
      buyLinks,
      image,
    } = req.body;

    if (!req.admin || !req.admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    if (!brand || !model) {
      return res.status(400).json({ message: "brand and model are required" });
    }

    const updatedLaptop = await laptopModel.findOneAndUpdate(
      { brand, model },
      {
        processor_brand,
        processor_name,
        processor_gnrtn,
        ram_gb,
        ram_type,
        ssd,
        hdd,
        os,
        os_bit,
        graphic_card_gb,
        weight,
        display_size,
        warranty,
        Touchscreen,
        msoffice,
        latest_price,
        old_price,
        discount,
        star_rating,
        ratings,
        reviews,
        buyLinks,
        image,
      },
      { new: true, upsert: true }, // upsert = create if not found
    );

    return res.status(200).json({
      message: "Laptop updated successfully",
      data: updatedLaptop,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err });
  }
};

module.exports.deleteDevice = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.admin || !req.admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    let deleted = await mobileModel.findByIdAndDelete(id);
    if (deleted) {
      return res
        .status(200)
        .json({ success: true, message: "Mobile deleted successfully" });
    }
    deleted = await laptopModel.findByIdAndDelete(id);
    if (deleted) {
      return res
        .status(200)
        .json({ success: true, message: "Laptop deleted successfully" });
    }
    return res
      .status(404)
      .json({ success: false, message: "Device not found" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

module.exports.registerMobile = async (req, res) => {
  try {
    const { name, specs, price, buyLinks, image, betterFor } = req.body;

    if (!req.admin || !req.admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    if (!name || !specs || !price || !image) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (name, specs, price, image)",
      });
    }

    console.log("Incoming Mobile Data:", req.body);

    const formattedSpecs = Array.isArray(specs) ? specs : [];
    const formattedPrice = typeof price === "string" ? price : `${price}`;
    const formattedLinks = Array.isArray(buyLinks) ? buyLinks : [];

    const newMobile = new mobileModel({
      name,
      specs: formattedSpecs,
      price: formattedPrice,
      buyLinks: formattedLinks,
      image,
      betterFor,
    });

    await newMobile.save();

    return res.status(201).json({
      success: true,
      message: "Mobile device registered successfully",
      device: newMobile,
    });
  } catch (err) {
    console.error("Register Mobile Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while registering mobile",
    });
  }
};

module.exports.registerLaptop = async (req, res) => {
  try {
    const {
      brand,
      model,
      processor_brand,
      processor_name,
      processor_gnrtn,
      ram_gb,
      ram_type,
      ssd,
      hdd,
      os,
      os_bit,
      graphic_card_gb,
      weight,
      display_size,
      warranty,
      Touchscreen,
      msoffice,
      latest_price,
      old_price,
      discount,
      star_rating,
      ratings,
      reviews,
      buyLinks,
      image,
    } = req.body;

    if (!req.admin || !req.admin.isAdmin) {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    // Input validation
    if (!brand || !model || !latest_price || !image) {
      return res.status(400).json({
        success: false,
        message: "Brand, Model, Latest Price, and Image are required!",
      });
    }

    // Calculate discount if not provided
    const oldPriceNum = parseFloat(old_price) || 0;
    const latestPriceNum = parseFloat(latest_price);
    const calculatedDiscount =
      oldPriceNum > 0
        ? Math.round(((oldPriceNum - latestPriceNum) / oldPriceNum) * 100)
        : 0;

    // Sanitize buyLinks - match exact DB structure
    const formattedBuyLinks =
      buyLinks && Array.isArray(buyLinks)
        ? buyLinks
            .filter((link) => link.site && link.url)
            .map((link) => ({
              site: link.site.trim(),
              url: link.url.trim(),
              // MongoDB will auto-generate _id
            }))
        : [];

    // Format laptop data EXACTLY like your DB structure
    const laptopData = {
      brand: brand.trim(),
      model: model.trim(),
      processor_brand: processor_brand?.trim() || "",
      processor_name: processor_name?.trim() || "",
      processor_gnrtn: processor_gnrtn?.trim() || "",
      ram_gb: ram_gb?.trim() || "",
      ram_type: ram_type?.trim() || "",
      ssd: ssd?.trim() || "",
      hdd: hdd?.trim() || "",
      os: os?.trim() || "",
      os_bit: os_bit?.trim() || "",
      graphic_card_gb: graphic_card_gb?.trim() || "",
      weight: weight?.trim() || "",
      display_size: display_size?.trim() || "",
      warranty: warranty?.trim() || "",
      Touchscreen: Touchscreen?.trim() || "",
      msoffice: msoffice?.trim() || "",
      latest_price: latestPriceNum, // Number (24990)
      old_price: oldPriceNum, // Number (32790)
      discount: parseInt(discount) || calculatedDiscount, // Number (23)
      star_rating: parseFloat(star_rating) || 0, // Number (3.7)
      ratings: parseInt(ratings) || 0, // Number (63)
      reviews: parseInt(reviews) || 0, // Number (12)
      buyLinks: formattedBuyLinks, // Array of {site, url}
      image: image.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Console.log for debugging
    console.log("📤 Saving laptop:", {
      brand: laptopData.brand,
      model: laptopData.model,
      latest_price: laptopData.latest_price,
      discount: laptopData.discount,
      buyLinks: laptopData.buyLinks,
    });

    // Save to database
    const newLaptop = await laptopModel.create(laptopData);

    console.log(
      `✅ Laptop registered: ${brand} ${model} (ID: ${newLaptop._id})`,
    );

    res.status(201).json({
      success: true,
      message: "Laptop registered successfully!",
      data: newLaptop,
    });
  } catch (err) {
    console.error("❌ Laptop registration error:", err);

    res.status(500).json({
      success: false,
      message: "Failed to register laptop",
      error:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Internal server error",
    });
  }
};
