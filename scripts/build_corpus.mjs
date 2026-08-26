#!/usr/bin/env node
/** Build web/public/corpus.json from MODS + tesseract OCR + overrides + dedupe. */
import { execSync } from "child_process";
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "data");
const WEB_PUBLIC = join(ROOT, "web", "public");
const IMAGES_OUT = join(WEB_PUBLIC, "images");
const OVERRIDES_PATH = join(DATA, "processed", "ocr_overrides.json");

function dollar(obj) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(dollar);
  if (typeof obj === "object") {
    if ("$" in obj && Object.keys(obj).length <= 4) return obj["$"];
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = dollar(v);
    return out;
  }
  return obj;
}

function parseDate(originInfo) {
  if (!originInfo || typeof originInfo !== "object") return null;
  for (const key of ["dateCreated", "dateIssued", "copyrightDate"]) {
    let dc = originInfo[key];
    if (!dc) continue;
    if (Array.isArray(dc)) dc = dc[0];
    if (typeof dc === "object" && dc !== null) return dc["$"] || dc.keyDate || null;
    if (typeof dc === "string") return dc;
  }
  return null;
}

function parsePlace(originInfo) {
  const pl = originInfo?.place;
  if (!pl) return null;
  let pt = pl.placeTerm;
  if (Array.isArray(pt)) pt = pt[0];
  return pt?.["$"] || (typeof pt === "string" ? pt : null);
}

function yearFromDate(dateStr) {
  if (!dateStr) return null;
  const m = String(dateStr).match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function ocrImage(imagePath) {
  try {
    return execSync(`tesseract "${imagePath}" stdout -l eng 2>/dev/null`, {
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024,
    })
      .replace(/\s+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return "";
  }
}

function loadOverrides() {
  if (!existsSync(OVERRIDES_PATH)) return {};
  return JSON.parse(readFileSync(OVERRIDES_PATH, "utf8"));
}

function loadItems() {
  const index = parse(readFileSync(join(DATA, "processed", "index.csv"), "utf8"), {
    columns: true,
    skip_empty_lines: true,
  });

  return index.map((row) => {
    const modsPath = join(DATA, "raw", "mods", `${row.uuid}.json`);
    const modsRaw = JSON.parse(readFileSync(modsPath, "utf8"));
    const mods = dollar(modsRaw.nyplAPI.response.mods);
    let titleInfo = mods.titleInfo;
    if (Array.isArray(titleInfo)) titleInfo = titleInfo[0];
    const date = parseDate(mods.originInfo);
    const place = parsePlace(mods.originInfo);
    const isDocument = row.type_of_resource === "text";

    return {
      uuid: row.uuid,
      title: row.title || titleInfo?.title || row.uuid,
      type: isDocument ? "document" : "photo",
      date,
      year: yearFromDate(date),
      place,
      image_id: row.image_id,
      item_link: row.item_link,
      rights_uri: row.rights_uri,
      image: `/images/${row.uuid}.jpg`,
      ocr: null,
      _isDocument: isDocument,
    };
  });
}

function mergeDuplicates(items) {
  const groups = new Map();
  for (const item of items) {
    const key = `${item.title}|${item.date || ""}|${item.type}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }

  const merged = [];
  for (const group of groups.values()) {
    group.sort((a, b) => a.uuid.localeCompare(b.uuid));
    const primary = { ...group[0] };
    if (group.length > 1) {
      primary.alternateScans = group.slice(1).map((g) => ({
        uuid: g.uuid,
        image: g.image,
        item_link: g.item_link,
        ocr: g.ocr,
      }));
      if (primary.type === "document") {
        const best = group.reduce((a, b) => ((a.ocr?.length || 0) >= (b.ocr?.length || 0) ? a : b));
        primary.ocr = best.ocr;
        primary.uuid = best.uuid;
        primary.image = best.image;
        primary.item_link = best.item_link;
        primary.image_id = best.image_id;
        primary.alternateScans = group
          .filter((g) => g.uuid !== primary.uuid)
          .map((g) => ({ uuid: g.uuid, image: g.image, item_link: g.item_link, ocr: g.ocr }));
      }
    }
    merged.push(primary);
  }

  merged.sort((a, b) => {
    const da = a.date || "";
    const db = b.date || "";
    return da.localeCompare(db) || a.title.localeCompare(b.title);
  });
  return merged;
}

function searchText(item) {
  const parts = [item.title, item.place, item.date, item.ocr || ""];
  if (item.alternateScans) {
    for (const alt of item.alternateScans) parts.push(alt.ocr || "");
  }
  return parts.filter(Boolean).join(" ").toLowerCase();
}

function main() {
  mkdirSync(IMAGES_OUT, { recursive: true });
  const overrides = loadOverrides();
  const items = loadItems();

  for (const item of items) {
    const src = join(DATA, "images", `${item.uuid}.jpg`);
    const dest = join(IMAGES_OUT, `${item.uuid}.jpg`);
    if (existsSync(src)) copyFileSync(src, dest);

    if (item._isDocument) {
      process.stderr.write(`OCR ${item.uuid.slice(0, 8)}…\n`);
      item.ocr = overrides[item.uuid] || ocrImage(src);
    }
    delete item._isDocument;
  }

  const deduped = mergeDuplicates(items);
  for (const item of deduped) {
    item.searchText = searchText(item);
  }

  const corpus = {
    generated_at: new Date().toISOString(),
    collection: "Stratemeyer Syndicate records",
    nypl_collection:
      "https://digitalcollections.nypl.org/collections/a592e400-a43e-013d-0b89-0242ac110003",
    item_count: deduped.length,
    scan_count: items.length,
    items: deduped,
  };

  writeFileSync(join(WEB_PUBLIC, "corpus.json"), JSON.stringify(corpus, null, 2));
  console.log(`Wrote ${deduped.length} timeline panels (${items.length} scans) → web/public/corpus.json`);
}

main();
