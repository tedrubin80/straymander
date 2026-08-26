#!/usr/bin/env bash
# Re-sync data/ from local nypl-collections crawl (requires NYPL token there).
set -euo pipefail
SRC="${NYPL_COLLECTIONS_DIR:-$HOME/nypl-collections}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/data"

if [[ ! -d "$SRC/src" ]]; then
  echo "Missing nypl-collections at $SRC" >&2
  exit 1
fi

echo "Crawling stratemeyer_syndicate via $SRC ..."
(cd "$SRC" && python3 src/crawl.py stratemeyer_syndicate)

echo "Syncing to $DEST ..."
rsync -a --delete "$SRC/data/stratemeyer_syndicate/" "$DEST/"
echo "Done. $(wc -l < "$DEST/processed/index.csv") items in index."
