import express from "express";
import {
  getUserInfo,
  loginController,
  registerController,
  getUserProfile,
  updateUserProfile
} from "../controller/User.js";
import { requireSignIn, isAdmin } from "../middlewares/Auth.js";

const router = express.Router();

// Public routes
router.post("/register", registerController);
router.post("/login", loginController);
router.get('/user', getUserInfo);

// Protected user routes
router.get("/profile", requireSignIn, getUserProfile);
router.put("/profile", requireSignIn, updateUserProfile);

//protected User route auth
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//protected Admin route auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

export default router;
