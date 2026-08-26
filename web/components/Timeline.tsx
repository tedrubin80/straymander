import type { Corpus, CorpusItem } from "@/lib/types";
import { formatDate } from "@/lib/types";

function Panel({ item, index }: { item: CorpusItem; index: number }) {
  const side = index % 2 === 0 ? "left" : "right";

  return (
    <article className={`timelinePanel timelinePanel--${side}`} id={item.uuid}>
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
        <h2>{item.title}</h2>
        <a href={item.image} target="_blank" rel="noreferrer" className="timelineImageLink">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} loading="lazy" />
        </a>
        {item.ocr && (
          <details className="ocrBlock" open={index < 2}>
            <summary>Transcription (OCR)</summary>
            <pre>{item.ocr}</pre>
          </details>
        )}
        <footer className="timelineCardFooter">
          <a href={item.item_link} target="_blank" rel="noreferrer">
            View on NYPL →
          </a>
        </footer>
      </div>
    </article>
  );
}

export default function Timeline({ corpus }: { corpus: Corpus }) {
  const years = [...new Set(corpus.items.map((i) => i.year).filter(Boolean))].sort(
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
          {corpus.items.length} items · {years[0]}–{years[years.length - 1]} ·{" "}
          <a href={corpus.nypl_collection} target="_blank" rel="noreferrer">
            Source collection
          </a>
        </p>
      </header>

      <div className="timelineRail">
        {corpus.items.map((item, i) => (
          <Panel key={item.uuid} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}
