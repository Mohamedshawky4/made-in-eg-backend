const Product = require('./product.model');
const Category = require('../categories/category.model');
const AppError = require('./../../utils/AppError');

const escapeRegex = (string) => string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');


// Create a new product (Admin only)
exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        product: newProduct,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get all products (Public)
exports.getAllProducts = async (req, res, next) => {
  try {
    // 1) Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'categorySlug'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle Search (Text search across ar/en title & description can be complex without text index,
    // using regex for simplicity here for both english and arabic titles)
    if (req.query.search) {
      const safeSearch = escapeRegex(req.query.search);
      const searchRegex = new RegExp(safeSearch, 'i');
      queryObj.$or = [
        { title_ar: searchRegex },
        { title_en: searchRegex },
        { description_ar: searchRegex },
        { description_en: searchRegex },
      ];
    }

    // Handle Category Filtering by Slug
    // If a slug is provided (e.g. "women"), we need to find all subcategories of that slug too.
    if (req.query.categorySlug) {
        const category = await Category.findOne({ fullSlug: req.query.categorySlug });
        if (category) {
            // Find this category AND all its descendants
            // The descendants will have a fullSlug starting with `${category.fullSlug}/`
            const subCategories = await Category.find({
                $or: [
                    { _id: category._id },
                    { fullSlug: new RegExp(`^${escapeRegex(category.fullSlug)}/`) }
                ]
            });
            const subCategoryIds = subCategories.map(c => c._id);
            queryObj.category = { $in: subCategoryIds };
        } else {
             // Return empty if category not found
            queryObj.category = null;
        }
    }

    // Build query
    let query = Product.find(queryObj).populate('category', 'name_ar name_en fullSlug slug');

    // 2) Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // default sort
    }

    // 3) Pagination
    const page = req.query.page * 1 || 1;
    let limit = req.query.limit * 1 || 20; // Default limit 20
    limit = Math.min(limit, 100);
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    // Execute query
    const products = await query;
    const totalCount = await Product.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: products.length,
      total: totalCount,
      page,
      pages: Math.ceil(totalCount / limit),
      data: {
        products,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get single product
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name_ar name_en fullSlug slug');

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get Related Products
exports.getRelatedProducts = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);
        if(!product) return next(new AppError('Product not found', 404));

        // Find products in the same category, excluding the current one
        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        })
        .limit(5)
        .populate('category', 'name_ar name_en fullSlug');

        res.status(200).json({
            status: 'success',
            results: relatedProducts.length,
            data: {
                products: relatedProducts,
            },
        });
    } catch(err) {
        next(err);
    }
}


// Update product (Admin only)
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('category', 'name_ar name_en fullSlug slug');

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        product,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Soft Delete product (Admin only)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
    });

    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};
