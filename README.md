# straymander

**Stratemeyer Syndicate records** — a small, self-contained mirror of NYPL’s digitized archive of the book-packaging factory behind *Nancy Drew*, *Hardy Boys*, *Tom Swift*, and dozens of other juvenile series.

Codename **straymander**; source collection: [NYPL Stratemeyer Syndicate records](https://digitalcollections.nypl.org/collections/a592e400-a43e-013d-0b89-0242ac110003).

## What’s here

| | |
|--|--|
| **Items** | 11 digitized captures (photos + manuscript/legal scans) |
| **On disk** | ~3.3 MB — JPEG scans, MODS metadata, index CSV/Parquet |
| **Era** | ~1890s–1940s (Edward Stratemeyer, heirs, Nancy Drew film still) |

This repo is sized to live comfortably on GitHub (~3 MB total). No LFS needed.

## Layout

```
data/
  images/          # NYPL JPEG scans ({uuid}.jpg)
  raw/mods/        # MODS API responses ({uuid}.json)
  processed/
    index.csv      # flat catalog
    index.parquet
CATALOG.md         # human-readable item list
```

## Highlights

- **Horatio Alger manuscript transfer** to Edward Stratemeyer (unfinished ms.)
- **Copyright transfer** for *The Young Band Master* (Capt. Ralph Bonehill pseudonym)
- **Edward Stratemeyer portraits** + family photos (Harriet at Wellesley, Magdalene Stratemeyer)
- **Nancy Drew Detective** (1938) — Frankie Thomas & Bonita Granville still
- **Juvenile literature past and present** — syndicate publishing notes (2 copies)

See [`CATALOG.md`](CATALOG.md) for the full item table with NYPL links.

## Rights

Rights vary per item (`rights_uri` in `index.csv`):

- **NoC-US** — manuscript/copyright docs (reuse with attribution)
- **UND** — some portraits/stills; check NYPL before commercial reuse

Do not commit `NYPL_API_TOKEN`. Scans remain courtesy of The New York Public Library.

## Site (timeline + OCR)

Static Next.js app in [`web/`](web/) — no database. Documents are OCR'd with Tesseract; legal transfers have manual cleanup in `data/processed/ocr_overrides.json`.

```bash
npm run corpus              # rebuild corpus.json + copy images
cd web && npm run dev       # http://localhost:3000
```

Features: paneled timeline (1876–1938), full-text search over OCR, per-item pages, duplicate-scan merging.

Deploy to Vercel: **Root Directory = `web`**, no env vars.

- **Live:** https://straymander.vercel.app
- **Dataset:** [Hugging Face](https://huggingface.co/datasets/datamatters24/straymander-stratemeyer) · [Kaggle](https://www.kaggle.com/datasets/theodorerubin/stratemeyer-syndicate-nypl)

## Publish & backup

```bash
bash ~/scripts/straymander-publish-datasets.sh   # HF + Kaggle
bash ~/scripts/straymander-backup-storagebox.sh  # storagebox:straymander
```

## Refresh from NYPL

Initial pull was via [`nypl-collections`](../nypl-collections) on this host:

```bash
cd ~/nypl-collections
cp .env.example .env   # NYPL_API_TOKEN
python src/crawl.py stratemeyer_syndicate   # ~25 API calls
rsync -a data/stratemeyer_syndicate/ ~/straymander/data/
```

Or re-clone this repo if you only need the static bundle.

## Related projects

- [`benucpidata`](https://github.com/tedrubin80/benucpidata) — Buttolph menus + Menu CPI
- [`nypl-collections`](https://github.com/tedrubin80) — other niche NYPL pulls (Zander menus, Chinese crime paintings)

## License

Metadata and indexing scripts: MIT where applicable. **Image rights follow NYPL per-item statements** — see `data/processed/index.csv` column `rights_uri`.
