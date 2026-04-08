import { z } from "zod";

export const updateNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Content cannot be empty").optional(),
  }),
});