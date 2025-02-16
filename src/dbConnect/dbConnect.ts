import mongoose from "mongoose";

const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return; // Already connected
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log("Connected to DataBase");
    } catch (error) {
        console.log("Error connecting to DataBase", error);
        throw error;
    }
};

export default connectDB;
