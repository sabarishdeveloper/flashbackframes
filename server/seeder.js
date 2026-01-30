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
        name: 'Minimalist Oak Frame',
        category: 'Photo Frames',
        price: 29.99,
        description: 'A beautifully crafted oak frame with a minimalist design. Perfect for modern interiors.',
        options: {
            sizes: ['5x7', '8x10', '11x14', '16x20'],
            materials: ['Wood', 'Metal', 'Plastic']
        },
        images: []
    },
    {
        name: 'Personalized Mug',
        category: 'Custom Gifts',
        price: 14.99,
        description: 'Start your morning with a smile. High-quality ceramic mug with your custom photo.',
        options: {
            sizes: ['11oz', '15oz'],
            materials: ['Ceramic']
        },
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
