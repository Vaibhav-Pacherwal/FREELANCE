import express from "express"
import cors from "cors";
import connectToDB from "./config/db.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import offerRoutes from "./routes/offer.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import cookieParser from "cookie-parser";
import User from "./models/user.model.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import addressRoutes from "./routes/address.routes.js"
import orderRoutes from "./routes/order.routes.js";
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
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(productRoutes);
app.use(categoryRoutes);
app.use(offerRoutes);
app.use(settingsRoutes);
app.use("/cart", cartRoutes);
app.use(wishlistRoutes);
app.use(addressRoutes);
app.use(orderRoutes);

const PORT = process.env.PORT;

const main = async () => {
    await connectToDB();
    
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
}

main();

// const addAdmin = async () => {
//   const password = await bcrypt.hash("admin2139", 10);

//   const newAdmin = await User.create({
//     name: "Vaibhav Pacherwal",
//     email: "vaibhavpacherwal2139@gmail.com",
//     passwordHash: password,
//     role: "admin",
//   });

//   console.log(newAdmin);
// }

// addAdmin();