import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";
import logger from "../log/logger";

const authoriseUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;
    if (!token) {
        logger.warn('Unauthorized user login request');
        return res.status(403).json({"message": "User unauthorized"});
    }

    try {
        const accessKey = process.env.ACCESS_KEY;
        if (accessKey) {
            const data = jwt.verify(token, accessKey);
            req.user = data;
            logger.info('User cookie verified successfully')
            return next();
        }
    } catch (err) {
        logger.error('Unauthorized user login request', err);
        return res.sendStatus(403);
    }
}

export default authoriseUser;