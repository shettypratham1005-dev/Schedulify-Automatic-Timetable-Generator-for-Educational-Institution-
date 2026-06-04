const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/user"); // your file is user.js

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/Timetable", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

async function createTestUser() {
    try {
        const existingUser = await User.findOne({ email: "pratham@example.com" });
        if (existingUser) {
            console.log("User already exists. Exiting...");
            mongoose.disconnect();
            return;
        }

        const hashedPassword = await bcrypt.hash("123456", 10); // password: 123456

        const user = new User({
            name: "Pratham",
            email: "pratham@example.com",
            password: hashedPassword
        });

        await user.save();
        console.log("✅ Test user created successfully!");
        mongoose.disconnect();
    } catch (err) {
        console.error("Error creating user:", err);
        mongoose.disconnect();
    }
}

createTestUser();