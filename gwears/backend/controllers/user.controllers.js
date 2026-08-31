import { google as googleapis } from "googleapis";
import googleClient from "../config/google.js";
import generateJWT from "../utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Product from "../models/product.model.js";

const google = async (req, res) => {

    const url = googleClient.generateAuthUrl({
        access_type: "offline",

        scope: [
            "openid",
            "profile",
            "email"
        ],

        include_granted_scopes: true
    });

    res.redirect(url);
};


const googleCallback = async (req, res) => {

    try {

        const { code } = req.query;

        const { tokens } = await googleClient.getToken(code);

        googleClient.setCredentials(tokens);

        const oauth2 = googleapis.oauth2({
            auth: googleClient,
            version: "v2"
        });

        const { data } = await oauth2.userinfo.get();

        const user = await User.findOne({
            email: data.email
        });

        if (!user) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        if(user.emailVerified === false) {
            user.avatar = data.picture;
            user.googleId = data.id;
            user.emailVerified = true;
            await user.save();
        }

        const token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,       // localhost
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.redirect("http://localhost:5173/admin");

    } catch (error) {

        console.error(error);

        res.status(500).send("OAuth failed");

    }
};

const login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const user = await User.findOne({ email: email }).select("+passwordHash");

        if(!user) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);

        if(!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        let token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 24 * 60 * 60 * 1000
        });

        return res.status(201).json({
            message: "Login successfully",
            user
        });

    } catch (error) {

        console.error(error);
        
        res.status(500).json({
            message: "Admin login failed"
        });
    }
}

const logout = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,        
        sameSite: "none",    
    });

    res.status(200).json({message: "Logged Out"});
}

const verify = async (req, res) => {
    const products = await Product.find({});

    return res.json({
        user: req.user,
        prods: products
    });
}

export { google, googleCallback, login, logout, verify };