import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const protect = async (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                message: "Not authorized, no token",
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Account has been deactivated. Please contact support.",
            });
        }

        req.user = user;

        next();

    } catch (err) {
        console.log(err);

        return res.status(401).json({
            message: "Not authorized, token failed",
        });
    }
};

export default protect;