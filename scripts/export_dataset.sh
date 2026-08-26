#!/usr/bin/env bash
# Export straymander bundle for HF/Kaggle (data + OCR + index).
set -euo pipefail
ROOT=/home/grimdolf/straymander
OUT="$ROOT/exports/dataset"
KAGGLE="$ROOT/exports/kaggle"
rm -rf "$OUT" "$KAGGLE"
mkdir -p "$OUT/images" "$OUT/mods" "$OUT/processed" "$KAGGLE"

cp "$ROOT/data/processed/index.csv" "$OUT/processed/"
cp "$ROOT/data/processed/index.parquet" "$OUT/processed/" 2>/dev/null || true
cp "$ROOT/data/processed/ocr_overrides.json" "$OUT/processed/" 2>/dev/null || true
cp -a "$ROOT/data/images/." "$OUT/images/"
cp -a "$ROOT/data/raw/mods/." "$OUT/mods/"
cp "$ROOT/web/public/corpus.json" "$OUT/stratemeyer_corpus.json"
cp "$ROOT/CATALOG.md" "$OUT/"

cat > "$OUT/README.md" <<'EOF'
# Stratemeyer Syndicate records (NYPL)

11 digitized items from NYPL's Stratemeyer Syndicate collection — photos, manuscript transfers, copyright assignments, and syndicate publishing notes.

- `stratemeyer_corpus.json` — timeline metadata + OCR transcriptions
- `images/` — NYPL JPEG scans
- `mods/` — raw MODS API metadata
- `processed/index.csv` — flat catalog

Source: https://digitalcollections.nypl.org/collections/a592e400-a43e-013d-0b89-0242ac110003

Site: https://github.com/tedrubin80/straymander
EOF

rsync -a "$OUT/" "$KAGGLE/"
cat > "$KAGGLE/dataset-metadata.json" <<'EOF'
{
  "title": "Stratemeyer Syndicate NYPL Records",
  "id": "theodorerubin/stratemeyer-syndicate-nypl",
  "licenses": [{"name": "CC0-1.0"}]
}
EOF

echo "Export ready: $OUT ($(du -sh "$OUT" | cut -f1))"
