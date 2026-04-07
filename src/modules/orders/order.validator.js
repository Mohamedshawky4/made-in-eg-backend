const z = require('zod');
const { validate } = require('../auth/auth.validator');

const createOrderSchema = z.object({
  body: z.object({
    shippingAddress: z.object({
        fullName: z.string().min(1, 'Full name is required'),
        email: z.string().email('Invalid email address'),
        phone: z.string().min(1, 'Phone number is required'),
        address: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
    }),
    paymentMethod: z.enum(['cash', 'card'], {
        errorMap: () => ({ message: 'Invalid payment method' })
    }).optional(),
  }),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
        errorMap: () => ({ message: 'Invalid status value' })
    }),
  }),
});

module.exports = {
  validate,
  createOrderSchema,
  updateOrderStatusSchema
};
