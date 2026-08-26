export type AlternateScan = {
  uuid: string;
  image: string;
  item_link: string;
  ocr?: string | null;
};

export type CorpusItem = {
  uuid: string;
  title: string;
  type: "document" | "photo";
  date: string | null;
  year: number | null;
  place: string | null;
  image_id: string | null;
  item_link: string;
  rights_uri: string;
  image: string;
  ocr: string | null;
  alternateScans?: AlternateScan[];
  searchText?: string;
};

export type Corpus = {
  generated_at: string;
  collection: string;
  nypl_collection: string;
  item_count: number;
  scan_count: number;
  items: CorpusItem[];
};

export function formatDate(date: string | null): string {
  if (!date) return "Unknown date";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const d = new Date(date + "T12:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
  if (/^\d{4}-\d{2}$/.test(date)) {
    const [y, m] = date.split("-");
    const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long" });
  }
  return date;
}

export function nyplThumb(imageId: string | null): string | null {
  if (!imageId) return null;
  return `https://images.nypl.org/index.php?id=${imageId}&t=w`;
}

export function rightsLabel(uri: string): string {
  if (uri.includes("NoC-US")) return "No Copyright — US";
  if (uri.includes("UND")) return "Copyright undetermined";
  return "See NYPL";
}
