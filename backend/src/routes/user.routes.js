import express from "express";
import {
  getProfile,
  getUserPosts,
  getMe,
  searchUsers,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, getMe);
router.get("/search", authenticate, searchUsers);
router.get("/:username", authenticate, getProfile);
router.get("/:username/posts", authenticate, getUserPosts);

export default router;
