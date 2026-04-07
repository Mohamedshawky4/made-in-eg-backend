require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../modules/users/user.model');
const Category = require('../modules/categories/category.model');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log('MongoDB Connected to seed...');
}).catch((err) => {
    console.error('Connection error', err);
    process.exit(1);
});

const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@madein.eg';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'password123',
                role: 'admin'
            });
            console.log('Admin user seeded. (admin@madein.eg / password123)');
        } else {
            console.log('Admin user already exists.');
        }
    } catch(err) {
         console.error('Error seeding admin', err);
    }
};

const seedCategories = async () => {
    try {
        await Category.deleteMany(); // Reset categories
        
        // Level 0 (Genders)
        const women = await Category.create({ name_ar: 'نساء', name_en: 'Women', slug: 'women', level: 0 });
        const men = await Category.create({ name_ar: 'رجال', name_en: 'Men', slug: 'men', level: 0 });

        // Level 1 (Types for Women)
        const womenClothes = await Category.create({ name_ar: 'ملابس', name_en: 'Clothing', slug: 'clothing', parent: women._id });
        const womenShoes = await Category.create({ name_ar: 'أحذية', name_en: 'Shoes', slug: 'shoes', parent: women._id });

        // Level 1 (Types for Men)
        const menClothes = await Category.create({ name_ar: 'ملابس', name_en: 'Clothing', slug: 'clothing', parent: men._id });

        // Level 2 (Subtypes)
        await Category.create({ name_ar: 'بلايز', name_en: 'Tops', slug: 'tops', parent: womenClothes._id });
        await Category.create({ name_ar: 'فساتين', name_en: 'Dresses', slug: 'dresses', parent: womenClothes._id });
        await Category.create({ name_ar: 'تي شيرت', name_en: 'T-Shirts', slug: 'tshirts', parent: menClothes._id });

        console.log('Categories seeded.');
    } catch(err) {
         console.error('Error seeding categories', err);
    }
}

const runSeeder = async () => {
    await seedAdmin();
    await seedCategories();
    process.exit();
}

runSeeder();
