import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import dotenv from "dotenv";
dotenv.config();

const protect = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({
                message: "Not authorized, no token"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if(!user) {
            return res.status(404).json({
                message: "Admin not registered"
            });
        }
        req.user = user;
        next();

    } catch(err) {
        console.log(err);

        return res.status(401).json({
            message: "Not authorized, token failed"
        });
    }
}

export default protect;