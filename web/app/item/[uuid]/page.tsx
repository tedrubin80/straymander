import Link from "next/link";
import { notFound } from "next/navigation";
import { allItemUuids, getItem, loadCorpus } from "@/lib/corpus";
import { formatDate, nyplThumb, rightsLabel } from "@/lib/types";

export const dynamic = "force-static";

export function generateStaticParams() {
  return allItemUuids().map((uuid) => ({ uuid }));
}

export function generateMetadata({ params }: { params: Promise<{ uuid: string }> }) {
  return params.then(({ uuid }) => {
    const item = getItem(uuid);
    if (!item) return { title: "Not found" };
    const desc = item.ocr
      ? item.ocr.slice(0, 160).replace(/\s+/g, " ") + "…"
      : `${item.title} — Stratemeyer Syndicate archive, ${formatDate(item.date)}`;
    const image = nyplThumb(item.image_id) || item.image;
    return {
      title: `${item.title} · Straymander`,
      description: desc,
      openGraph: {
        title: item.title,
        description: desc,
        images: image ? [{ url: image.startsWith("http") ? image : `https://straymander.vercel.app${image}` }] : [],
      },
    };
  });
}

export default async function ItemPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  const item = getItem(uuid);
  if (!item) notFound();

  return (
    <article className="itemPage">
      <nav className="itemNav">
        <Link href="/">← Timeline</Link>
      </nav>
      <header className="itemHeader">
        <p className="eyebrow">{item.type === "document" ? "Document" : "Photograph"} · {formatDate(item.date)}</p>
        <h1>{item.title}</h1>
        {item.place && <p className="itemPlace">{item.place}</p>}
        <p className="itemRights">{rightsLabel(item.rights_uri)}</p>
      </header>
      <div className="itemLayout">
        <div className="itemImageCol">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.image} alt={item.title} />
          {item.alternateScans?.map((alt) => (
            <figure key={alt.uuid} className="altFigure">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={alt.image} alt={`Alternate scan ${alt.uuid.slice(0, 8)}`} />
              <figcaption>
                <Link href={`/item/${alt.uuid}`}>Alternate scan</Link>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="itemBodyCol">
          {item.ocr ? (
            <section className="itemOcr">
              <h2>Transcription</h2>
              <pre>{item.ocr}</pre>
            </section>
          ) : (
            <p className="muted">No OCR text for this photograph.</p>
          )}
          <p className="itemLinks">
            <a href={item.item_link} target="_blank" rel="noreferrer">
              View on NYPL Digital Collections →
            </a>
          </p>
        </div>
      </div>
    </article>
  );
}
