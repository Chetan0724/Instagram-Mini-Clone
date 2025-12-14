import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(1, "Full name is required").optional(),
  bio: z.string().max(150, "Bio must be at most 150 characters").optional(),
});
