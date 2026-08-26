import Link from "next/link";
import SearchPanel from "@/components/SearchPanel";
import Timeline from "@/components/Timeline";
import { loadCorpus } from "@/lib/corpus";

export const dynamic = "force-static";

export default function HomePage() {
  const corpus = loadCorpus();
  return (
    <>
      <SearchPanel items={corpus.items} />
      <Timeline
        items={corpus.items}
        meta={{
          item_count: corpus.item_count,
          scan_count: corpus.scan_count,
          nypl_collection: corpus.nypl_collection,
        }}
      />
    </>
  );
}
