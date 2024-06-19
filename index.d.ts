import * as express from "express-serve-static-core";
import jwt from "jsonwebtoken";

declare global {
    namespace Express {
        interface Request {
            user?: string | jwt.JwtPayload;
        }
    }
}