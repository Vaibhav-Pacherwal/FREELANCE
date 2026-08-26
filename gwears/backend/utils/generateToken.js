import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const generateJWT = (userId) => {
    return jwt.sign({id: userId}, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN || "30d"
    });
}

export default generateJWT;