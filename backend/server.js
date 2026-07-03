const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Seed Default Admin User
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'Admin' });

    if (!adminExists) {
      const adminName = process.env.ADMIN_NAME || 'Society Admin';
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@society.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'Admin'
      });

      console.log(`Admin user seeded successfully!`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: (Configured via ADMIN_PASSWORD environment variable or defaults)`);
    } else {
      console.log('Admin user already exists. Skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding Admin user:', error.message);
  }
};

seedAdmin();

// Listen on Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
