"use client";

import { useRef, useState, type RefObject } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@clerk/nextjs";
import { ImagePlus, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";

import LoadingOverlay from "@/components/LoadingOverlay";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  checkBookExists,
  createBook,
  saveBookSegments,
} from "@/lib/actions/book.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { parsePDFFile } from "@/lib/utils";
import { upload } from "@vercel/blob/client";
import { DEFAULT_VOICE, voiceCategories, voiceOptions } from "@/lib/constants";
import { UploadSchema } from "@/lib/zod";
import type { BookUploadFormValues, BookUploadSubmitValues } from "@/types";

type FileDropzoneProps = {
  accept: string;
  files?: File[];
  hint: string;
  icon: typeof Upload;
  inputRef: RefObject<HTMLInputElement | null>;
  onChange: (files: File[]) => void;
  prompt: string;
};

function FileDropzone({
  accept,
  files,
  hint,
  icon: Icon,
  inputRef,
  onChange,
  prompt,
}: FileDropzoneProps) {
  const file = files?.[0];

  return (
    <div className={file ? "upload-dropzone upload-dropzone-uploaded" : "upload-dropzone"}>
      <input
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={(event) => onChange(event.target.files ? Array.from(event.target.files) : [])}
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
              onChange([]);

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

  const router = useRouter();
  const { userId } = useAuth();

  const form = useForm<BookUploadFormValues, unknown, BookUploadSubmitValues>({
    resolver: zodResolver(UploadSchema),
    defaultValues: {
      pdfFile: [],
      coverImage: [],
      title: "",
      author: "",
      voice: DEFAULT_VOICE,
    },
  });

  async function onSubmit(data: BookUploadSubmitValues) {
    setIsSubmitting(true);

    try {
      if (!userId) {
        toast.error("Please sign in to upload a book.");
        return;
      }

      const existsCheck = await checkBookExists(data.title);
      if (existsCheck.exists && existsCheck.data?.slug) {
        toast.info("Book already exists");
        form.reset();
        router.push(`/books/${existsCheck.data.slug}`);
        return;
      }

      const fileTitle = data.title.replace(/\s+/g, "-").toLowerCase();
      const pdfFile = data.pdfFile[0];
      const parsedPDF = await parsePDFFile(pdfFile);

      if (parsedPDF.content.length === 0) {
        toast.error("Failed to parse PDF");
        return;
      }

      const uploadedPdfBlob = await upload(fileTitle, pdfFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        contentType: "application/pdf",
      });

      let coverUrl: string;
      let coverBlobKey: string | undefined;

      if (data.coverImage && data.coverImage.length > 0) {
        const coverFile = data.coverImage[0];
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, coverFile, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: coverFile.type,
        });

        coverUrl = uploadedCoverBlob.url;
        coverBlobKey = uploadedCoverBlob.pathname;
      } else {
        const response = await fetch(parsedPDF.cover);
        const blob = await response.blob();
        const uploadedCoverBlob = await upload(`${fileTitle}_cover.png`, blob, {
          access: "public",
          handleUploadUrl: "/api/upload",
          contentType: "image/png",
        });

        coverUrl = uploadedCoverBlob.url;
        coverBlobKey = uploadedCoverBlob.pathname;
      }

      const book = await createBook({
        clerkId: userId,
        title: data.title,
        author: data.author,
        persona: data.voice,
        fileURL: uploadedPdfBlob.url,
        fileBlobKey: uploadedPdfBlob.pathname,
        coverURL: coverUrl,
        coverBlobKey,
        fileSize: pdfFile.size,
      });

      if (!book.success || !book.data?._id) {
        toast.error("Failed to create book.");
        return;
      }

      const segmentsResult = await saveBookSegments(
        book.data._id,
        userId,
        parsedPDF.content
      );

      if (!segmentsResult.success) {
        toast.error("Book was created, but segments could not be saved.");
        return;
      }

      console.log("Book upload payload", {
        ...data,
        bookId: book.data._id,
        coverUrl,
        fileUrl: uploadedPdfBlob.url,
      });

      toast.success("Book created successfully.");
      form.reset({
        pdfFile: [],
        coverImage: [],
        title: "",
        author: "",
        voice: DEFAULT_VOICE,
      });

      if (pdfInputRef.current) {
        pdfInputRef.current.value = "";
      }

      if (coverInputRef.current) {
        coverInputRef.current.value = "";
      }

      router.push(`/books/${book.data.slug}`);
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
              name="pdfFile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="form-label">Book PDF File</FormLabel>
                  <FormControl>
                    <FileDropzone
                      accept="application/pdf"
                      files={field.value}
                      hint="PDF file (max 50MB)"
                      icon={Upload}
                      inputRef={pdfInputRef}
                      onChange={field.onChange}
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
                      files={field.value}
                      hint="Leave empty to auto-generate from PDF"
                      icon={ImagePlus}
                      inputRef={coverInputRef}
                      onChange={field.onChange}
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
                          {voiceCategories.male.map((voiceKey) => {
                            const voice = voiceOptions[voiceKey];
                            const selected = field.value === voiceKey;

                            return (
                              <label
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                                key={voiceKey}
                              >
                                <input
                                  checked={selected}
                                  className="sr-only"
                                  name={field.name}
                                  onChange={() => field.onChange(voiceKey)}
                                  type="radio"
                                  value={voiceKey}
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
                          {voiceCategories.female.map((voiceKey) => {
                            const voice = voiceOptions[voiceKey];
                            const selected = field.value === voiceKey;

                            return (
                              <label
                                className={`voice-selector-option ${
                                  selected
                                    ? "voice-selector-option-selected"
                                    : "voice-selector-option-default"
                                }`}
                                key={voiceKey}
                              >
                                <input
                                  checked={selected}
                                  className="sr-only"
                                  name={field.name}
                                  onChange={() => field.onChange(voiceKey)}
                                  type="radio"
                                  value={voiceKey}
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
