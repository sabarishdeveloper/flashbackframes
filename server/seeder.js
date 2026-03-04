const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Product = require('./models/Product');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

const products = [
    {
        name: 'Classic Photo Frame (All Sizes)',
        category: 'Photo Frames',
        price: 0, // Price will be determined by size
        description: 'Premium quality photo frames available in all standard sizes with fixed pricing. Perfect for preserving your best moments.',
        options: {
            sizes: ['8x6', '10x8', '12x8', '12x10', '10x15', '12x15', '12x18', '12x24', '12x30', '12x36', '15x20', '16x20', '16x24', '18x24', '20x24', '20x30', '24x36', '30x40', '40x60'],
            materials: []
        },
        useGlobalPricing: true,
        images: []
    }
];

const seedData = async () => {
    try {
        // Delete existing data
        await User.deleteMany();
        await Product.deleteMany();

        // Create admin user
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@flashback.com',
            password: 'adminpassword123',
            role: 'admin'
        });

        console.log('Admin user created...');

        // Create products
        await Product.create(products);
        console.log('Sample products created...');

        console.log('Data Imported!');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedData();
