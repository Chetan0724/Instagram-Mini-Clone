import express from "express";
import { createComment } from "../controllers/comment.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { createCommentSchema } from "../validations/comment.validation.js";

const router = express.Router();

router.post(
  "/:postId",
  authenticate,
  validate(createCommentSchema),
  createComment
);

export default router;
