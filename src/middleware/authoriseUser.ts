import {Request, Response, NextFunction} from "express";
import jwt from "jsonwebtoken";

const authoriseUser = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.access_token;
    if (!token) {
        return res.status(403).json({"message": "User unauthorized"});
    }

    try {
        const accessKey = process.env.ACCESS_KEY;
        if (accessKey) {
            const data = jwt.verify(token, accessKey);
            req.user = data;
            return next();
        }
    } catch (err) {
        console.log(err)
        return res.sendStatus(403);
    }
}

export default authoriseUser;