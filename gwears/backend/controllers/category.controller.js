import Category from "../models/category.model.js";
import Product from "../models/product.model.js";

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

const createCategory = async (req, res) => {
    try {
        const {
            name,
            description,
        } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const trimmedName = name.trim();

        const slug = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const existingCategory = await Category.findOne({
            $or: [
                { name: trimmedName },
                { slug },
            ],
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        const category = await Category.create({
            name: trimmedName,
            slug,
            description: description?.trim() || "",
            isActive: true,
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category,
        });

    } catch (error) {
        console.error("Create category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to create category",
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            description,
            // isActive,
        } = req.body;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const trimmedName = name.trim();

        const slug = trimmedName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const duplicateCategory = await Category.findOne({
            _id: { $ne: id },
            $or: [
                { name: trimmedName },
                { slug },
            ],
        });

        if (duplicateCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists",
            });
        }

        category.name = trimmedName;
        category.slug = slug;
        category.description = description?.trim() || "";
        // category.isActive =
        //     isActive === "true" ||
        //     isActive === true;

        await category.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });

    } catch (error) {
        console.error("Update category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to update category",
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        const productCount = await Product.countDocuments({
            category: id,
        });

        if (productCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category because ${productCount} product${
                    productCount === 1 ? "" : "s"
                } ${
                    productCount === 1 ? "is" : "are"
                } using it.`,
            });
        }

        await Category.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (error) {
        console.error("Delete category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to delete category",
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        return res.status(200).json({
            success: true,
            category,
        });

    } catch (error) {
        console.error("Get category error:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch category",
        });
    }
};

const toggleCategoryStatus = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            });
        }

        category.isActive = !category.isActive;

        await category.save();

        res.json({
            message: "Category status updated",
            category
        });

    } catch (error) {
        console.error("Toggle category status error:", error);

        res.status(500).json({
            message: "Failed to update category status"
        });
    }
};

export { getCategories, createCategory, updateCategory, deleteCategory, getCategoryById, toggleCategoryStatus };