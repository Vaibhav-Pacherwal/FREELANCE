import { google as googleapis } from "googleapis";
import googleClient from "../config/google.js";
import generateJWT from "../utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import Product from "../models/product.model.js";
import Offer from "../models/offer.model.js";
import StoreSettings from "../models/storeSetting.model.js";

const google = async (req, res) => {
    const requestedRole = req.query.role;

    if (!["admin", "customer"].includes(requestedRole)) {
        return res.status(400).json({
            message: "Invalid authentication role",
        });
    }

    const url = googleClient.generateAuthUrl({
        access_type: "offline",

        scope: [
            "openid",
            "profile",
            "email",
        ],

        include_granted_scopes: true,

        state: requestedRole,
    });

    res.redirect(url);
};

const googleCallback = async (req, res) => {
    try {
        const { code, state } = req.query;

        const requestedRole = state;

        if (!["admin", "customer"].includes(requestedRole)) {
            return res.redirect(
                `${process.env.CLIENT_URL}/auth?error=invalid-auth`
            );
        }

        const { tokens } = await googleClient.getToken(code);

        googleClient.setCredentials(tokens);

        const oauth2 = googleapis.oauth2({
            auth: googleClient,
            version: "v2",
        });

        const { data } = await oauth2.userinfo.get();

        let user = await User.findOne({
            email: data.email,
        });

        if (requestedRole === "admin") {

            if (!user) {
                return res.redirect(
                    `${process.env.CLIENT_URL}/auth?error=admin-not-found`
                );
            }

            if (user.role !== "admin") {
                return res.redirect(
                    `${process.env.CLIENT_URL}/auth?error=not-admin`
                );
            }
        }

        if (requestedRole === "customer") {

            if (user && user.role === "admin") {
                return res.redirect(
                    `${process.env.CLIENT_URL}/login?error=not-customer`
                );
            }

            if (!user) {
                user = await User.create({
                    name: data.name,
                    email: data.email,
                    avatar: data.picture,
                    googleId: data.id,
                    emailVerified: true,
                    role: "customer",
                });
            }
        }

        if (!user.googleId) {
            user.googleId = data.id;
        }

        if (!user.avatar && data.picture) {
            user.avatar = data.picture;
        }

        if (!user.emailVerified) {
            user.emailVerified = true;
        }

        await user.save();

        if (!user.isActive) {

            const redirectPath =
                requestedRole === "admin"
                    ? "/auth"
                    : "/login";

            return res.redirect(
                `${process.env.CLIENT_URL}${redirectPath}?error=disabled`
            );
        }

        const token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        if (user.role === "admin") {
            return res.redirect(
                `${process.env.CLIENT_URL}/admin`
            );
        }

        return res.redirect(
            `${process.env.CLIENT_URL}/`
        );

    } catch (error) {

        console.error("Google OAuth Error:", error);

        const redirectPath =
            req.query.state === "admin"
                ? "/auth"
                : "/login";

        return res.redirect(
            `${process.env.CLIENT_URL}${redirectPath}?error=oauth-failed`
        );
    }
};

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const trimmedName = name.trim();
        const normalizedEmail = email.toLowerCase().trim();

        if (!trimmedName) {
            return res.status(400).json({
                message: "Name is required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await User.findOne({
            email: normalizedEmail,
        }).select("+passwordHash");

        if (existingUser) {
            // Existing Google-only account
            if (!existingUser.passwordHash) {
                return res.status(409).json({
                    message:
                        "An account already exists with this email. Please continue with Google.",
                });
            }

            return res.status(409).json({
                message: "An account already exists with this email",
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: trimmedName,
            email: normalizedEmail,
            passwordHash,
            role: "customer",
            emailVerified: false,
        });

        const token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(201).json({
            message: "Account created successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Registration failed",
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const expectedRole = req.expectedRole || "customer";

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                message: "Account has been disabled",
            });
        }

        if (user.role !== expectedRole) {
            return res.status(403).json({
                message:
                    expectedRole === "admin"
                        ? "This account is not an admin account."
                        : "This account is an admin account. Please use admin login.",
            });
        }

        if (!user.passwordHash) {
            return res.status(400).json({
                message:
                    "This account uses Google login. Please continue with Google.",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateJWT(user._id);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                emailVerified: user.emailVerified,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
};

const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",
        });

        return res.status(200).json({
            message: "Logged out successfully",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Logout failed",
        });
    }
};

const verify = async (req, res) => {
    try {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const [
            products,
            activeProducts,
            offers,
            recentProducts,
            storeSettings
        ] = await Promise.all([
            Product.find({}),
            Product.find({ isActive: true }),
            Offer.find({}),

            Product.find({
                createdAt: { $gte: oneWeekAgo },
            }).sort({ createdAt: -1 }),

            StoreSettings.findOne({})
        ]);

        return res.json({
            user: req.user,
            prods: products,
            offers,
            activeProds: activeProducts,
            recentProducts,
            storeSettings,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch data",
        });
    }
};

const getMe = async (req, res) => {
    try {
        return res.status(200).json({
            user: {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                avatar: req.user.avatar,
                role: req.user.role,
                emailVerified: req.user.emailVerified,
            },
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to fetch user",
        });
    }
};

export { google, googleCallback, login, logout, verify, register, getMe };