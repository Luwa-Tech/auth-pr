import { Request, Response } from "express-serve-static-core";
import User from "../model/User";
import { matchedData } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../log/logger";


export const registerNewUser = async (req: Request, res: Response) => {
    logger.http(`Incoming request at ${req.path}`);
    const data = matchedData(req);

    const findUser = await User.findOne({ email: data.email });
    if (findUser) {
        logger.warn(`Registration attempt failed: Email ${data.email} already in use`);
        return res.status(409).json({ "message": "Email already in use" });
    }

    try {
        const hashedPwd = await bcrypt.hash(data.password, 10);
        const results = await User.create({
            email: data.email,
            password: hashedPwd
        });

        await results.save();

        logger.info(`User registered successfully: ${results.email}`);
        res.status(201).json({ "message": "User created successfully" });
    } catch (err) {
        logger.error(`Internal server error during user registration for email: ${data.email}`, err);
        return res.status(500).json({ "message": "Internal server error" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    logger.http(`Incoming request at ${req.path}`);
    const data = matchedData(req);

    const findUser = await User.findOne({ email: data.email });
    if (!findUser) {
        logger.warn(`Login attempt failed: Email ${data.email} does not exist`);
        return res.status(400).json({ "message": "User does not exist" });
    }

    const match = await bcrypt.compare(data.password, findUser.password);
    if (!match) {
        return res.status(400).json({ "message": "Incorrect password" });
    }

    try {
        const accessKey = process.env.ACCESS_KEY;
        if (accessKey) {
            const token = jwt.sign({ id: findUser._id }, accessKey, { expiresIn: "1h" });

            return res.cookie("access_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            }).status(200).json({ "message": "Logged in successfully" });
        }
    } catch (err) {
        logger.error(`Internal server error during user login for email: ${data.email}`, err);
        return res.status(500).json({ "message": "Internal server error" });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    logger.http(`Incoming request at ${req.path}`);
    return res.clearCookie("access_token").status(200).json({"message": "logged out successfully"});
};