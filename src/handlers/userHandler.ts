import { Request, Response } from "express-serve-static-core";
import User from "../model/User";
import { matchedData } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const registerNewUser = async (req: Request, res: Response) => {
    const data = matchedData(req);
    const findUser = await User.findOne({ email: data.email });
    if (findUser) {
        return res.status(409).json({ "message": "Email already in use" });
    }

    try {
        const hashedPwd = await bcrypt.hash(data.password, 10);
        const results = await User.create({
            email: data.email,
            password: hashedPwd
        });

        await results.save();

        res.status(201).json({ "message": "User created successfully" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ "message": "Internal server error" });
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const data = matchedData(req);
    const findUser = await User.findOne({ email: data.email });
    if (!findUser) {
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
        console.log(err);
        return res.status(500).json({ "message": "Internal server error" });
    }
};

export const logoutUser = async (req: Request, res: Response) => {
    return res.clearCookie("access_token").status(200).json({"message": "logged out successfully"});
};