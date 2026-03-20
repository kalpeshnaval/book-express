"use client";

import { useRef, useState, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import LoadingOverlay from "@/components/LoadingOverlay";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const maxPdfSize = 50 * 1024 * 1024;

const voices = {
  male: [
    {
      value: "dave",
      name: "Dave",
      description: "Young male, British-Essex, casual & conversational",
    },
    {
      value: "daniel",
      name: "Daniel",
      description: "Middle-aged male, British, authoritative but warm",
    },
    {
      value: "chris",
      name: "Chris",
      description: "Male, casual & easy-going",
    },
  ],
  female: [
    {
      value: "rachel",
      name: "Rachel",
      description: "Young female, American, calm & clear",
    },
    {
      value: "sarah",
      name: "Sarah",
      description: "Young female, American, soft & approachable",
    },
  ],
} as const;

const voiceValues = [
  ...voices.male.map((voice) => voice.value),
  ...voices.female.map((voice) => voice.value),
] as const;

const uploadSchema = z.object({
  pdf: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, {
      message: "Please upload a PDF file.",
    })
    .refine((file) => file instanceof File, {
      message: "Please upload a PDF file.",
    })
    .refine((file) => !file || file.type === "application/pdf", {
      message: "Only PDF files are supported.",
    })
    .refine((file) => !file || file.size <= maxPdfSize, {
      message: "PDF file must be 50MB or smaller.",
    }),
  coverImage: z
    .custom<File | undefined>(
      (value) => value === undefined || value instanceof File,
      {
        message: "Cover image must be a valid file.",
      }
    )
    .refine((file) => !file || file.type.startsWith("image/"), {
      message: "Cover image must be an image file.",
    })
    .optional(),
  title: z.string().trim().min(1, "Title is required."),
  author: z.string().trim().min(1, "Author name is required."),
  voice: z.enum(voiceValues),
});

type UploadFormInput = z.input<typeof uploadSchema>;
type UploadFormValues = z.output<typeof uploadSchema>;

type FileDropzoneProps = {
  accept: string;
  file?: File;
  hint: string;
  icon: typeof Upload;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (file?: File) => void;
  prompt: string;
};

function FileDropzone({
  accept,
  file,
  hint,
  icon: Icon,
  inputRef,
  onChange,
  prompt,
}: FileDropzoneProps) {
  return (
    <div className={file ? "upload-dropzone upload-dropzone-uploaded" : "upload-dropzone"}>
      <input
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0])}
        type="file"
      />

      {!file ? (
        <button
          className="flex h-full w-full flex-col items-center justify-center"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <Icon className="upload-dropzone-icon" />
          <span className="upload-dropzone-text">{prompt}</span>
          <span className="upload-dropzone-hint">{hint}</span>
        </button>
      ) : (
        <div className="flex w-full items-center justify-between gap-3 px-5">
          <div className="min-w-0">
            <p className="upload-dropzone-text truncate text-left">{file.name}</p>
            <p className="upload-dropzone-hint text-left">{hint}</p>
          </div>
          <button
            aria-label={`Remove ${file.name}`}
            className="upload-dropzone-remove"
            onClick={() => {
              onChange(undefined);

              if (inputRef.current) {
                inputRef.current.value = "";
              }
            }}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function UploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormInput, unknown, UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      pdf: undefined,
      coverImage: undefined,
      title: "",
      author: "",
      voice: "rachel",
    },
  });

  async function onSubmit(values: UploadFormValues) {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("Book upload payload", values);
      form.reset({
        pdf: undefined,
        coverImage: undefined,
        title: "",
        author: "",
        voice: "rachel",
      });

      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }

      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <LoadingOverlay open={isSubmitting} title="Beginning synthesis" />

      <div className="new-book-wrapper">
        <Form {...form}>
          <form
            className="space-y-8"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="pdf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Book PDF File</FormLabel>
                  <FormControl>
                    <FileDropzone
                      accept="application/pdf"
                      file={field.value}
                      hint="PDF file (max 50MB)"
                      icon={Upload}
                      inputRef={pdfInputRef}
                      onChange={(file) => field.onChange(file)}
                      prompt="Click to upload PDF"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Cover Image (Optional)</FormLabel>
                  <FormControl>
                    <FileDropzone
                      accept="image/*"
                      file={field.value}
                      hint="Leave empty to auto-generate from PDF"
                      icon={ImagePlus}
                      inputRef={coverInputRef}
                      onChange={(file) => field.onChange(file)}
                      prompt="Click to upload cover image"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Title</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="form-input"
                      placeholder="ex: Rich Dad Poor Dad"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Author Name</FormLabel>
                  <FormControl>
                    <input
                      {...field}
                      className="form-input"
                      placeholder="ex: Robert Kiyosaki"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="voice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Choose Assistant Voice</FormLabel>
                  <FormControl className="space-y-5">
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-[#7a6e63]">Male Voices</p>
                        <div className="voice-selector-options flex-col md:grid md:grid-cols-3">
                          {voices.male.map((voice) => {
                            const selected = field.value === voice.value;

                            return (
                              <label
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                                key={voice.value}
                              >
                                <input
                                  checked={selected}
                                  className="sr-only"
                                  name={field.name}
                                  onChange={() => field.onChange(voice.value)}
                                  type="radio"
                                  value={voice.value}
                                />
                                <span className="mt-1 size-3 rounded-full border border-[#cbb99f] bg-white shadow-inner">
                                  <span
                                    className={`block size-full rounded-full bg-[#663820] transition ${
                                      selected ? "scale-60 opacity-100" : "scale-0 opacity-0"
                                    }`}
                                  />
                                </span>
                                <span className="flex-1 text-left">
                                  <span className="block text-base font-semibold text-[#222]">
                                    {voice.name}
                                  </span>
                                  <span className="block text-sm leading-5 text-[#7a6e63]">
                                    {voice.description}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm font-medium text-[#7a6e63]">Female Voices</p>
                        <div className="voice-selector-options flex-col md:grid md:grid-cols-2">
                          {voices.female.map((voice) => {
                            const selected = field.value === voice.value;

                            return (
                              <label
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                                key={voice.value}
                              >
                                <input
                                  checked={selected}
                                  className="sr-only"
                                  name={field.name}
                                  onChange={() => field.onChange(voice.value)}
                                  type="radio"
                                  value={voice.value}
                                />
                                <span className="mt-1 size-3 rounded-full border border-[#cbb99f] bg-white shadow-inner">
                                  <span
                                    className={`block size-full rounded-full bg-[#663820] transition ${
                                      selected ? "scale-60 opacity-100" : "scale-0 opacity-0"
                                    }`}
                                  />
                                </span>
                                <span className="flex-1 text-left">
                                  <span className="block text-base font-semibold text-[#222]">
                                    {voice.name}
                                  </span>
                                  <span className="block text-sm leading-5 text-[#7a6e63]">
                                    {voice.description}
                                  </span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <button className="form-btn" disabled={isSubmitting} type="submit">
              Begin Synthesis
            </button>
          </form>
        </Form>
      </div>
    </>
  );
}
