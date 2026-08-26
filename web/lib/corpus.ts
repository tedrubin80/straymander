import { readFileSync } from "fs";
import { join } from "path";
import type { Corpus, CorpusItem } from "./types";

let cached: Corpus | null = null;

export function loadCorpus(): Corpus {
  if (cached) return cached;
  const path = join(process.cwd(), "public", "corpus.json");
  cached = JSON.parse(readFileSync(path, "utf8")) as Corpus;
  return cached;
}

export function getItem(uuid: string): CorpusItem | undefined {
  const corpus = loadCorpus();
  const direct = corpus.items.find((i) => i.uuid === uuid);
  if (direct) return direct;
  for (const item of corpus.items) {
    if (item.alternateScans?.some((a) => a.uuid === uuid)) {
      const alt = item.alternateScans.find((a) => a.uuid === uuid)!;
      return {
        ...item,
        uuid: alt.uuid,
        image: alt.image,
        item_link: alt.item_link,
        ocr: alt.ocr ?? item.ocr,
        alternateScans: [
          { uuid: item.uuid, image: item.image, item_link: item.item_link, ocr: item.ocr },
          ...item.alternateScans.filter((a) => a.uuid !== uuid),
        ],
      };
    }
  }
  return undefined;
}

export function allItemUuids(): string[] {
  const corpus = loadCorpus();
  const ids = new Set<string>();
  for (const item of corpus.items) {
    ids.add(item.uuid);
    item.alternateScans?.forEach((a) => ids.add(a.uuid));
  }
  return [...ids];
}
