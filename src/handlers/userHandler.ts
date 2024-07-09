import { Request, Response } from "express-serve-static-core";
import { matchedData } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import logger from "../log/logger";
import UserService from "../service/userService";

class UserHandler {
    private userService: UserService;
    constructor (userService: UserService) {
        this.userService = userService;
    }

    public registerNewUser = async (req: Request, res: Response):  Promise<void> => {
        logger.http(`Incoming request at ${req.path}`);
        const data = matchedData(req);

        const findUser = await this.userService.getUser(data.email);
        console.log(findUser)
        if (findUser) {
            logger.warn(`Registration attempt failed: Email ${data.email} already in use`);
            res.status(409).json({ "message": "Email already in use" });
            return;
        }

        try {
            const hashedPwd = await bcrypt.hash(data.password, 10);
            await this.userService.createUser({
                email: data.email,
                password: hashedPwd
            });

            logger.info("User registered successfully");
            res.status(201).json({ "message": "User created successfully" });
        } catch (err) {
            logger.error(`Internal server error during user registration for email: ${data.email}`, err);
            res.status(500).json({ "message": "Internal server error" });
        }
    }

    public loginUser = async (req: Request, res: Response): Promise<void> => {
        logger.http(`Incoming request at ${req.path}`);
        const data = matchedData(req);

        const findUser = await this.userService.getUser(data.email);
        if (!findUser) {
            logger.warn(`Login attempt failed: Email ${data.email} does not exist`);
            res.status(400).json({ "message": "User does not exist" });
            return;
        }
    
        const match = await bcrypt.compare(data.password, findUser.password);
        if (!match) {
            res.status(400).json({ "message": "Incorrect password" });
            return;
        }
    
        try {
            const accessKey = process.env.ACCESS_KEY;
            if (accessKey) {
                const token = jwt.sign({ id: findUser._id }, accessKey, { expiresIn: "1h" });
                res.cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                }).status(200).json({ "message": "Logged in successfully" });
            }

        } catch (err) {
            logger.error(`Internal server error during user login for email: ${data.email}`, err);
            res.status(500).json({ "message": "Internal server error" });
        }
    }

    public logoutUser = async (req: Request, res: Response): Promise<void> => {
        logger.http(`Incoming request at ${req.path}`);
        res.clearCookie("access_token").status(200).json({"message": "logged out successfully"});
    }
}


export default UserHandler;