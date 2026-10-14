# Car cutouts

How the transparent vehicle WebPs in `public/img/cars/` were made (2026-10-14). Local only — nothing is uploaded.

```bash
python3 -m venv venv && ./venv/bin/pip install "rembg[cpu]"      # ~500 MB incl. the isnet model on first run
mkdir -p out
./venv/bin/python cutout.py "BYD Dolphin 2024.jpg" 3200 isnet-general-use out/dolphin   # fetch from Commons + rembg (alpha matting)
./venv/bin/python clean.py  out/dolphin.png out/dolphin-clean.png                        # keep the largest object, de-fringe, feather
# edit finish.py for the asset (privacy blurs etc.), then export 1400 px WebP, q88, alpha q96
```

Rules that came out of doing it:
- **Pick the source photo for completeness, not resolution.** Show-floor shots clip the car, include staff and signs; a clean full-car street shot cuts out far better. Reject anything where a person touches the car.
- **Privacy:** blur number plates and any identifiable face (the E07's plate and driver window are blurred in `finish.py`).
- **Licence:** prefer CC0. CC BY / BY-SA need the credit in `lib/cars.ts` (rendered as the figcaption); BY-SA is share-alike for the cutout.
- Register the file in `src/lib/cars.ts` (size must equal the file's real pixels — `cars.node.test.ts` checks alpha, width ≥ 1200, < 180 KB and a complete credit).
- Only EVs. A petrol or plug-in-hybrid car does not belong on an EV-battery site.
