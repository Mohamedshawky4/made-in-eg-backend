const Category = require('./category.model');
const AppError = require('./../../utils/AppError');

// Create a new category (Admin only)
exports.createCategory = async (req, res, next) => {
  try {
    const newCategory = await Category.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        category: newCategory,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all categories (Public)
exports.getAllCategories = async (req, res, next) => {
  try {
    // If we want to return categories logically, we might want to return them grouped by parent 
    // or return the top-level categories, and the client fetches subcategories.
    // Let's implement a feature to fetch categories as a nested tree

    const isTree = req.query.tree === 'true';

    let categories;
    if (isTree) {
      // Build a tree of categories
      const allCategories = await Category.find().lean();
      
      const buildTree = (parentId = null) => {
        return allCategories
          .filter(cat => String(cat.parent) === String(parentId))
          .map(cat => ({
            ...cat,
            children: buildTree(cat._id),
          }));
      };

      categories = buildTree(null);
    } else {
      // Standard flat response, optionally filtered by parent
      const filter = {};
      if (req.query.parent !== undefined) {
          filter.parent = req.query.parent === 'null' ? null : req.query.parent;
      }
      categories = await Category.find(filter);
    }

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: {
        categories,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get a single category by ID or fullSlug
exports.getCategory = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let query;

    // Check if it's a valid ObjectId, otherwise treat it as a fullSlug
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
        query = { _id: idOrSlug };
    } else {
        // Fix encoded slashes if sent as URL params
        query = { fullSlug: idOrSlug.replace(/%2F/g, '/') };
    }

    const category = await Category.findOne(query);

    if (!category) {
      return next(new AppError('No category found with that ID or slug', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Update a category (Admin only)
exports.updateCategory = async (req, res, next) => {
  try {
    // Cannot update 'level' directly, it is determined by parent
    const updates = { ...req.body };
    delete updates.level;
    delete updates.fullSlug; // This should be auto-recalculated if parent or slug changes

    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('No category found with that ID', 404));
    }

    Object.keys(updates).forEach(key => {
        category[key] = updates[key];
    });

    await category.save(); // using .save() to trigger the 'pre save' hook to rebuild fullSlug

    res.status(200).json({
      status: 'success',
      data: {
        category,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Delete a category (Admin only)
exports.deleteCategory = async (req, res, next) => {
  try {
    // Prevent deletion if it has children
    const childrenCount = await Category.countDocuments({ parent: req.params.id });
    if(childrenCount > 0) {
        return next(new AppError('Cannot delete a category that has subcategories. Delete them first.', 400));
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return next(new AppError('No category found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
