import uploadToCloudinary from "../utils/cloudinaryUpload.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      isActive,
    } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one product image is required",
      });
    }

    const uploadedImages = await Promise.all(
      req.files.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer);

        return {
          url: result.secure_url,
          publicId: result.public_id,
        };
      })
    );

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category,
      images: uploadedImages,
      isActive: isActive === "true" || isActive === true,
    });

    return res.status(201).json({
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create product",
    });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      search = "",
      category,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const filter = {};

    if (search.trim()) {
      filter.name = {
        $regex: search.trim(),
        $options: "i",
      };
    }

    if (category) {
      filter.category = category;
    }

    if (status === "active") {
      filter.isActive = true;
    }

    if (status === "inactive") {
      filter.isActive = false;
    }

    const skip = (pageNumber - 1) * limitNumber;

    const [products, totalProducts] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNumber),

      Product.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalProducts / limitNumber);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalProducts,
        limit: limitNumber,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

export { createProduct, getProducts };