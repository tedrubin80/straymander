import "./globals.css";

export const metadata = {
  title: "Straymander — Stratemeyer Syndicate Timeline",
  description:
    "NYPL Stratemeyer Syndicate records: Nancy Drew factory papers, portraits, and OCR transcriptions on a historical timeline.",
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
          OCR via Tesseract · Public-domain / rights per item at NYPL
        </footer>
      </body>
    </html>
  );
}
