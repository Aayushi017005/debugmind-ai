const mongoose = require("mongoose");

const connectDB = async() => {
    try {
        console.log("🔄 Connecting to MongoDB...");
        console.log("URI:", process.env.MONGO_URI);

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 30000,
            connectTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });

        console.log("✅ MongoDB Connected Successfully");
    } catch (err) {
        console.error("\n========== MONGODB CONNECTION ERROR ==========\n");
        console.error(err);

        if (err.cause) {
            console.error("\n========== ERROR CAUSE ==========\n");
            console.error(err.cause);
        }

        process.exit(1);
    }
};

module.exports = connectDB;