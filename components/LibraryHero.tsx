import Link from "next/link";
import { Plus } from "lucide-react";

const steps = [
  {
    number: "1",
    title: "Upload PDF",
    description: "Add your book file",
  },
  {
    number: "2",
    title: "AI Processing",
    description: "We analyze the content",
  },
  {
    number: "3",
    title: "Voice Chat",
    description: "Discuss with AI",
  },
];

function LibraryIllustration() {
  return (
    <div className="library-vignette" aria-hidden="true">
      <div className="library-lamp">
        <div className="library-lamp-head" />
        <div className="library-lamp-16neck" />
        <div className="library-lamp-base" />
        <div className="library-lamp-glow" />
      </div>

      <div className="library-globe">
        <div className="library-globe-sphere" />
        <div className="library-globe-stand" />
      </div>

      <div className="library-books-stack">
        <span className="library-book library-book-left" />
        <span className="library-book library-book-center" />
        <span className="library-book library-book-right" />
      </div>

      <div className="library-open-book">
        <span className="library-open-page library-open-page-left" />
        <span className="library-open-page library-open-page-right" />
        <span className="library-open-book-spine" />
      </div>
    </div>
  );
}

export default function LibraryHero() {
  return (
    <section className="wrapper">
      <div className="library-hero-card">
        <div className="library-hero-content">
          <div className="library-hero-text">
            <div className="space-y-3">
              <h1 className="library-hero-title">Your Library</h1>
              <p className="library-hero-description">
                Convert your books into interactive AI conversations. Listen,
                learn, and discuss your favorite reads.
              </p>
            </div>

            <Link href="/books/new" className="library-cta-primary">
              <Plus className="size-5 stroke-[2.5]" />
              <span>Add new book</span>
            </Link>
          </div>

          <div className="library-hero-illustration-desktop">
            <LibraryIllustration />
          </div>

          <div className="library-hero-illustration">
            <LibraryIllustration />
          </div>

          <aside className="library-steps-card" aria-label="How it works">
            {steps.map((step) => (
              <div className="library-step-item" key={step.number}>
                <span className="library-step-number">{step.number}</span>
                <div className="space-y-0.5">
                  <p className="library-step-title">{step.title}</p>
                  <p className="library-step-description">{step.description}</p>
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
}
