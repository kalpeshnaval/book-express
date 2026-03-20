import { z } from "zod";

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_PDF_TYPES,
  MAX_FILE_SIZE,
  MAX_IMAGE_SIZE,
  voiceOptions,
} from "@/lib/constants";

const voiceKeys = Object.keys(voiceOptions) as [
  keyof typeof voiceOptions,
  ...(keyof typeof voiceOptions)[],
];

export const UploadSchema = z.object({
  pdfFile: z
    .array(z.instanceof(File))
    .min(1, "Please upload a PDF file.")
    .max(1, "Please upload only one PDF file.")
    .refine((files) => ACCEPTED_PDF_TYPES.includes(files[0]?.type ?? ""), {
      message: "Only PDF files are supported.",
    })
    .refine((files) => (files[0]?.size ?? 0) <= MAX_FILE_SIZE, {
      message: "PDF file must be 50MB or smaller.",
    }),
  coverImage: z
    .array(z.instanceof(File))
    .max(1, "Please upload only one cover image.")
    .optional()
    .refine(
      (files) => !files || files.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files[0]?.type ?? ""),
      {
        message: "Cover image must be a JPG, PNG, or WebP file.",
      }
    )
    .refine(
      (files) => !files || files.length === 0 || (files[0]?.size ?? 0) <= MAX_IMAGE_SIZE,
      {
        message: "Cover image must be 10MB or smaller.",
      }
    ),
  title: z.string().trim().min(1, "Title is required."),
  author: z.string().trim().min(1, "Author name is required."),
  voice: z.enum(voiceKeys),
});
