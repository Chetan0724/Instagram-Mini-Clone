import express from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from "../controllers/follow.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:userId", authenticate, followUser);
router.delete("/:userId", authenticate, unfollowUser);
router.get("/:userId/followers", authenticate, getFollowers);
router.get("/:userId/following", authenticate, getFollowing);

export default router;
