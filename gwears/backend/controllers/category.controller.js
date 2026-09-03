import Category from "../models/category.model.js";

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

export { getCategories };