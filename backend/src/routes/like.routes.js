import express from "express";
import {
  likePost,
  unlikePost,
  getPostLikes,
} from "../controllers/like.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/:postId", authenticate, likePost);
router.delete("/:postId", authenticate, unlikePost);
router.get("/:postId", authenticate, getPostLikes);

export default router;
