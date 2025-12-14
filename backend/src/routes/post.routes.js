import express from "express";
import {
  createPost,
  getFeed,
  getPost,
  getPostComments,
} from "../controllers/post.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createPostSchema } from "../validations/post.validation.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  upload.single("postImage"),
  validate(createPostSchema),
  createPost
);
router.get("/feed", authenticate, getFeed);
router.get("/:postId", authenticate, getPost);
router.get("/:postId/comments", authenticate, getPostComments);

export default router;
