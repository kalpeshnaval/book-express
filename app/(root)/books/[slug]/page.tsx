import { notFound } from "next/navigation";

import { connectToDatabase } from "@/database/mongoose";
import Book from "@/database/models/book.model";

type BookPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function BookDetailPage({ params }: BookPageProps) {
  const { slug } = await params;

  await connectToDatabase();
  const book = await Book.findOne({ slug }).lean();

  if (!book) {
    notFound();
  }

  return (
    <main className="wrapper container">
      <section className="rounded-[18px] border border-[var(--border-subtle)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-[#8b7d6a]">
          Book Detail
        </p>
        <h1 className="mt-3 font-serif text-3xl font-semibold text-[var(--text-primary)] md:text-4xl">
          {book.title}
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          by {book.author}
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-[var(--bg-primary)] p-5">
            <p className="text-sm font-medium text-[#8b7d6a]">Assistant Voice</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {book.persona ?? "Not selected"}
            </p>
          </div>
          <div className="rounded-2xl bg-[var(--bg-primary)] p-5">
            <p className="text-sm font-medium text-[#8b7d6a]">Segments Indexed</p>
            <p className="mt-2 text-lg font-semibold text-[var(--text-primary)]">
              {book.totalSegments}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
