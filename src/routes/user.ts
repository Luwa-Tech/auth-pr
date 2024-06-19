import express from "express";
import { validations, validateRequestBody } from "../middleware/validateRequestBody";
import { registerNewUser, loginUser, logoutUser } from "../handlers/userHandler";
import authoriseUser from "../middleware/authoriseUser";
const router = express.Router();

router.post("/register", validateRequestBody(validations), registerNewUser)
router.post("/login", validateRequestBody(validations), loginUser)
router.get("/logout", logoutUser)

export default router;