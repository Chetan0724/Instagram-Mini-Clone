import { z } from "zod";

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_.]+$/,
      "Username can only contain letters, numbers, underscores, and dots"
    ),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  bio: z.string().max(150, "Bio must be at most 150 characters").optional(),
});

export const postSchema = z.object({
  caption: z
    .string()
    .max(2200, "Caption must be at most 2200 characters")
    .optional(),
});

export const commentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment too long"),
});

export const validateFileSize = (file) => {
  const maxSize = 5 * 1024 * 1024;
  return file.size <= maxSize;
};

export const validateFileType = (file) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  return allowedTypes.includes(file.type);
};
