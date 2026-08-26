import type { Metadata } from "next";
import "./globals.css";
import { loadCorpus } from "@/lib/corpus";
import { nyplThumb } from "@/lib/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://straymander.vercel.app";

function ogImage(): string {
  try {
    const corpus = loadCorpus();
    const portrait = corpus.items.find((i) => i.title.includes("Portrait of Edward Stratemeyer"));
    const thumb = nyplThumb(portrait?.image_id ?? corpus.items[0]?.image_id ?? null);
    return thumb || `${SITE_URL}/images/${corpus.items[0]?.uuid}.jpg`;
  } catch {
    return `${SITE_URL}/og.svg`;
  }
}

export const metadata: Metadata = {
  title: "Straymander — Stratemeyer Syndicate Timeline",
  description:
    "NYPL Stratemeyer Syndicate records: Nancy Drew factory papers, Horatio Alger manuscript transfer, portraits, and OCR transcriptions on a historical timeline.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Stratemeyer Syndicate — historical timeline",
    description: "NYPL archive of the Nancy Drew / Hardy Boys fiction factory — documents, photos, OCR.",
    type: "website",
    url: SITE_URL,
    siteName: "Straymander",
    images: [{ url: ogImage(), width: 760, height: 600, alt: "Edward Stratemeyer portrait" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stratemeyer Syndicate Timeline",
    description: "NYPL Stratemeyer Syndicate records with OCR transcriptions.",
    images: [ogImage()],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <footer className="siteFooter">
          <a href="https://digitalcollections.nypl.org/collections/a592e400-a43e-013d-0b89-0242ac110003">
            NYPL Stratemeyer Syndicate records
          </a>
          {" · "}
          <a href="https://github.com/tedrubin80/straymander">GitHub</a>
          {" · "}
          <a href="https://huggingface.co/datasets/datamatters24/straymander-stratemeyer">Dataset</a>
          {" · "}
          OCR via Tesseract · Rights per item at NYPL
        </footer>
      </body>
    </html>
  );
}
