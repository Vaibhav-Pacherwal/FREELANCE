import express from "express"
import cors from "cors";
import connectToDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import User from "./models/user.model.js";
import bcrypt from "bcrypt";
import dotenv from "dotenv"
dotenv.config();

const app = express();

const allowedOrigin = process.env.CLIENT_URL;
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));
app.use(express.json());
app.use(userRoutes);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT;

const main = async () => {
    await connectToDB();
    
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

main();

// const addAdmin = async () => {
//   const password = await bcrypt.hash("2139", 10);

//   const newAdmin = await User.create({
//     name: "Vaibhav Pacherwal",
//     email: "vaibhavpacherwal5@gmail.com",
//     passwordHash: password,
//   });

//   console.log(newAdmin);
// }

// addAdmin();