const z = require('zod');
const { validate } = require('../auth/auth.validator');

const createProductSchema = z.object({
  body: z.object({
    title_ar: z.string().min(1, 'Arabic title is required'),
    title_en: z.string().min(1, 'English title is required'),
    description_ar: z.string().min(1, 'Arabic description is required'),
    description_en: z.string().min(1, 'English description is required'),
    basePrice: z.number().min(0, 'Base price must be a positive number'),
    priceAfterDiscount: z.number().min(0, 'Discount price must be a positive number').optional(),
    quantity: z.number().min(0, 'Quantity cannot be negative'),
    imageCover: z.string().min(1, 'Cover image is required'),
    images: z.array(z.string()).optional(),
    category: z.string().min(1, 'Category ID is required'),
  }),
});

const updateProductSchema = z.object({
  body: z.object({
    title_ar: z.string().min(1).optional(),
    title_en: z.string().min(1).optional(),
    description_ar: z.string().min(1).optional(),
    description_en: z.string().min(1).optional(),
    basePrice: z.number().min(0).optional(),
    priceAfterDiscount: z.number().min(0).optional(),
    quantity: z.number().min(0).optional(),
    imageCover: z.string().min(1).optional(),
    images: z.array(z.string()).optional(),
    category: z.string().min(1).optional(),
  }),
});

module.exports = {
  validate,
  createProductSchema,
  updateProductSchema
};
