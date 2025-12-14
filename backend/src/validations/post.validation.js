import { z } from "zod";

export const createPostSchema = z.object({
  caption: z
    .string()
    .max(2200, "Caption must be at most 2200 characters")
    .optional(),
});
