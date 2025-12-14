import express from "express";
import {
  signup,
  login,
  refresh,
  logout,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, loginSchema } from "../validations/auth.validation.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  upload.single("profileImage"),
  validate(signupSchema),
  signup
);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
