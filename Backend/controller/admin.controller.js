import { Admin } from "../models/admin.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as z from "zod";
import config from "../config.js";

// ================= SIGNUP =================
export const signup = async (req, res) => {

    const adminSchema = z.object({
        firstName: z.string().min(3, "First name must be at least 3 characters"),
        lastName: z.string().min(3, "Last name must be at least 3 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
    });

    const validatedData = adminSchema.safeParse(req.body);

    if (!validatedData.success) {
        return res.status(400).json({
            error: validatedData.error.issues.map(err => err.message)
        });
    }

    const { firstName, lastName, email, password } = validatedData.data;

    try {

        const existingAdmin = await Admin.findOne({ email });

        if (existingAdmin) {
            return res.status(400).json({
                error: "Admin already exists with this email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new Admin({
            firstName,
            lastName,
            email,
            password: hashedPassword
        });

        await newAdmin.save();

        res.status(201).json({
            message: "Admin created successfully",
            user: newAdmin
        });

    } catch (error) {

        console.error("Error in signup:", error);

        res.status(500).json({
            error: "Error in signup"
        });
    }
};


// ================= LOGIN =================
export const login = async (req, res) => {

    const { email, password } = req.body;

    try {

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(403).json({
                error: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);

        if (!isPasswordValid) {
            return res.status(403).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            { id: admin._id },
            config.JWT_ADMIN_PASSWORD,
            { expiresIn: "1d" }
        );

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        };

        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({
            message: "Login successful",
            user:admin,
            token
        });

    } catch (error) {

        console.error("Error in login:", error);

        res.status(500).json({
            error: "Error in login"
        });
    }
};


// ================= LOGOUT =================
export const logout = async (req, res) => {

    try {
        if(!req.cookies.jwt) {
            return res.status(400).json({errors:"Kindly login first"});
        }

        res.clearCookie("jwt");

        res.status(200).json({
            message: "Logout successful"
        });

    } catch (error) {

        console.error("Error in logout:", error);

        res.status(500).json({
            error: "Error in logout"
        });
    }
};
