import express from "express";
import { addUserRole, loginUser, myProfile, registerUser, loginUserEmail, forgotPassword, resetPassword, changePassword } from "../controllers/auth.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/login-email", loginUserEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/change-password", isAuth, changePassword);
router.put("/add/role", isAuth, addUserRole);
router.get("/me", isAuth, myProfile);

export default router;
