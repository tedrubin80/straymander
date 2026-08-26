"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CorpusItem } from "@/lib/types";
import { formatDate } from "@/lib/types";

export default function SearchPanel({ items }: { items: CorpusItem[] }) {
  const [q, setQ] = useState("");

  const hits = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return [];
    return items.filter((item) => item.searchText?.includes(needle)).slice(0, 12);
  }, [q, items]);

  return (
    <section className="searchPanel">
      <label htmlFor="corpus-search" className="searchLabel">
        Search titles &amp; OCR transcriptions
      </label>
      <input
        id="corpus-search"
        type="search"
        placeholder="Horatio Alger, Nancy Drew, copyright, Elizabeth…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoComplete="off"
      />
      {q.trim() && (
        <ul className="searchHits">
          {hits.length === 0 ? (
            <li className="searchMiss">No matches for &ldquo;{q}&rdquo;</li>
          ) : (
            hits.map((item) => (
              <li key={item.uuid}>
                <Link href={`/item/${item.uuid}`}>
                  <strong>{item.title}</strong>
                  <span className="searchMeta">
                    {formatDate(item.date)} · {item.type}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </section>
  );
}
