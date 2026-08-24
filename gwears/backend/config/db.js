import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to mongodb");
    }).catch((err) => {
        console.log("Connection to mongodb failed", err);
    });
}

export default connectToDB;