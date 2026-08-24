import { z } from "zod";

export const PROJECT_TYPES = [
  "Web Application",
  "Mobile Application",
  "Product Design",
  "Cloud & DevOps",
  "Something else",
] as const;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  projectType: z.enum(PROJECT_TYPES, {
    message: "Please choose a project type",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more — at least 10 characters")
    .max(4000),
});

export type ContactInput = z.infer<typeof contactSchema>;
