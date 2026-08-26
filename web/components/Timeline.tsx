"use client";

import Link from "next/link";
import type { CorpusItem } from "@/lib/types";
import { formatDate, rightsLabel } from "@/lib/types";

function AlternateScans({ item }: { item: CorpusItem }) {
  if (!item.alternateScans?.length) return null;
  return (
    <div className="alternateScans">
      <p className="alternateLabel">Alternate NYPL scan{item.alternateScans.length > 1 ? "s" : ""}</p>
      <ul>
        {item.alternateScans.map((alt) => (
          <li key={alt.uuid}>
            <Link href={`/item/${alt.uuid}`}>View scan {alt.uuid.slice(0, 8)}…</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Panel({ item, index }: { item: CorpusItem; index: number }) {
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <article className={`timelinePanel timelinePanel--${side}`} id={item.uuid} data-search={item.searchText}>
      <div className="timelineMarker">
        <span className="timelineYear">{item.year ?? "—"}</span>
        <span className="timelineDot" data-type={item.type} />
      </div>
      <div className="timelineCard">
        <header className="timelineCardHeader">
          <span className={`badge badge--${item.type}`}>{item.type === "document" ? "Document" : "Photo"}</span>
          <time dateTime={item.date ?? undefined}>{formatDate(item.date)}</time>
          {item.place && <span className="timelinePlace">{item.place}</span>}
        </header>
        <h2>
          <Link href={`/item/${item.uuid}`}>{item.title}</Link>
        </h2>
        <Link href={`/item/${item.uuid}`} className="timelineImageLink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} loading="lazy" />
        </Link>
        {item.ocr && (
          <details className="ocrBlock" open={index < 2}>
            <summary>Transcription (OCR)</summary>
            <pre>{item.ocr.slice(0, 1200)}{item.ocr.length > 1200 ? "…" : ""}</pre>
            {item.ocr.length > 1200 && (
              <p className="ocrMore">
                <Link href={`/item/${item.uuid}`}>Full text →</Link>
              </p>
            )}
          </details>
        )}
        <AlternateScans item={item} />
        <footer className="timelineCardFooter">
          <Link href={`/item/${item.uuid}`}>Archive record →</Link>
          {" · "}
          <a href={item.item_link} target="_blank" rel="noreferrer">
            NYPL
          </a>
          {" · "}
          <span className="rightsTag">{rightsLabel(item.rights_uri)}</span>
        </footer>
      </div>
    </article>
  );
}

export default function Timeline({
  items,
  meta,
}: {
  items: CorpusItem[];
  meta: { item_count: number; scan_count: number; nypl_collection: string };
}) {
  const years = [...new Set(items.map((i) => i.year).filter(Boolean))].sort(
    (a, b) => (a as number) - (b as number),
  );

  return (
    <div className="timelineWrap">
      <header className="timelineIntro">
        <p className="eyebrow">NYPL Digital Collections</p>
        <h1>Stratemeyer Syndicate</h1>
        <p className="lead">
          A paneled timeline of the book-packaging factory behind <em>Nancy Drew</em>,{" "}
          <em>The Hardy Boys</em>, and dozens of juvenile series — portraits, contracts, and
          manuscript transfers from Edward Stratemeyer&apos;s archive.
        </p>
        <p className="meta">
          {meta.item_count} timeline panels · {meta.scan_count} NYPL scans · {years[0]}–
          {years[years.length - 1]} ·{" "}
          <a href={meta.nypl_collection} target="_blank" rel="noreferrer">
            Source collection
          </a>
        </p>
      </header>

      <div className="timelineRail">
        {items.map((item, i) => (
          <Panel key={item.uuid} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
