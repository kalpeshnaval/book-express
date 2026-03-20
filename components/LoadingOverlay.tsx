"use client";

import { LoaderCircle } from "lucide-react";

type LoadingOverlayProps = {
  open: boolean;
  title?: string;
};

export default function LoadingOverlay({
  open,
  title = "Preparing your book",
}: LoadingOverlayProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="loading-wrapper" role="status" aria-live="polite">
      <div className="loading-shadow-wrapper auth-shadow bg-[var(--bg-primary)]">
        <div className="loading-shadow">
          <LoaderCircle className="loading-animation size-10 text-[var(--accent-warm)]" />
          <div className="space-y-2 text-center">
            <h2 className="loading-title">{title}</h2>
            <div className="loading-progress">
              <div className="loading-progress-item">
                <span className="loading-progress-status" />
                <span>Uploading files and starting synthesis...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
