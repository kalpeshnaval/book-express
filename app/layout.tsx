import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const ibmPlexSerif = IBM_Plex_Serif({
  variable: '--font-ibm-plex-serif',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap'
})

export const monaSans = Mona_Sans({
  variable: '--font-mona-sans',
  subsets: ['latin'],
  display: 'swap'
})

export const metadata: Metadata = {
  title: "Book Express",
  description: "Have interactive AI conversation with your books. Upload pdfs and chat with your books using voice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSerif.variable} ${monaSans.variable} relative font-sans  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider>
          <Navbar>
            <Show when="signed-out">
              <div className="flex items-center gap-3">
                <SignInButton mode="modal">
                  <button className="rounded-full border border-[var(--border-subtle)] bg-white px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-[var(--shadow-soft-sm)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:bg-[var(--color-brand-hover)] hover:shadow-[var(--shadow-soft-md)]">
                    Sign up
                  </button>
                </SignUpButton>
              </div>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </Navbar>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
