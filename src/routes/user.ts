import express from "express";
import { validations, validateRequestBody } from "../middleware/validateRequestBody";
import UserHandler from "../handlers/userHandler";
import UserService from "../service/userService";
// import authoriseUser from "../middleware/authoriseUser";
const router = express.Router();

const userService = new UserService()
const userHandler = new UserHandler(userService)

router.post("/register", validateRequestBody(validations), userHandler.registerNewUser)
router.post("/login", validateRequestBody(validations), userHandler.loginUser)
router.get("/logout", userHandler.logoutUser)

export default router;