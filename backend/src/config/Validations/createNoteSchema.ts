import { z } from "zod";

export const createNoteSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Note content is required"),
  }),
});