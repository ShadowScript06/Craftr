import { z } from "zod";

export const createPreparationSessionSchema = z.object({
  body: z.object({
    role: z.string().min(1, "Role is required"),

    experience: z.number().int().min(0, "Experience must be a positive number"),

    description: z.string().min(1, "Description is required"),

    topicsToFocus: z
      .array(z.string().min(1))
      .min(1, "At least one topic is required"),
  }),
});
