import { z } from "zod";

export const createCommentSchema = z.object({
  text: z
    .string()
    .min(1, "Comment text is required")
    .max(500, "Comment must be at most 500 characters"),
});
