import Timeline from "@/components/Timeline";
import type { Corpus } from "@/lib/types";
import { readFileSync } from "fs";
import { join } from "path";

export const dynamic = "force-static";

function loadCorpus(): Corpus {
  const path = join(process.cwd(), "public", "corpus.json");
  return JSON.parse(readFileSync(path, "utf8")) as Corpus;
}

export default function HomePage() {
  const corpus = loadCorpus();
  return <Timeline corpus={corpus} />;
}
