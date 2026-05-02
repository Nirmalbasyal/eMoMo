const User = require("./model/userModel");
const bycrypt = require("bcryptjs");

const adminSeeder =  async () => {
    //  admin Seeding

    // check if admin user already exists
    const adminExists = await User.findOne({ userEmail: "admin@example.com" });
    if (!adminExists) {
        await User.create({
            userEmail: "admin@example.com",
            userPhoneNumber: 1234567890,
            userName: "Admin",
            userPassword: bycrypt.hashSync("admin123", 10),
            userRole: "admin"
        });
        console.log('Admin user created');
    } else {
        console.log('Admin user already exists');
    }
};
module.exports = adminSeeder;