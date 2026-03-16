## What you built — your approach and key decisions

- Overall approach  
  A small Next.js (App Router) application in the `web/` directory that:
  - Reads product label images from the repo-level `Sample_images/` folder.
  - Passes them through a pluggable OCR layer (simulated for this take‑home).
  - Parses line-oriented nutrition facts text into structured rows.
  - Normalises nutrient names and units into a consistent schema.
  - Writes a CSV to `output/nutrition_data.csv` at the repo root and exposes basic status via a web UI.

- Tech stack & structure
  - Frontend / API: Next.js 16, TypeScript, Tailwind, App Router (under `web/`).
  - Parsing / normalisation: `web/lib/nutrition/*`.
  - OCR integration: `web/lib/ocr.ts`.
  - Pipeline orchestration: `web/lib/pipeline.ts`.
  - Entry points:
    - UI: `web/app/page.tsx` – shows a “Run nutrition parser” button and status.
    - API: `web/app/api/parse/route.ts` – `POST /api/parse` runs the pipeline and returns metadata.

- **Data flow**
  1. User visits the Next.js app and clicks **Run nutrition parser**.
  2. Client calls `POST /api/parse`.
  3. API calls `runNutritionParsingPipeline()`:
     - Lists image files in `Sample_images/`.
     - For each image:
       - `extractTextFromImage` (OCR layer) returns pseudo-OCR text.
       - `parseNutritionText` extracts `name/amount/unit` per nutrient line.
       - Normalisers map names/units to canonical forms.
     - Aggregates all rows and writes `output/nutrition_data.csv`.
  4. API responds with `{ success, rowCount, processedImages, outputPath }`, which the UI displays.

- Schema & normalisation
  - CSV columns:
    - `product_image` – source image filename.
    - `nutrient_name_raw` – raw text (e.g. `Ascorbic Acid`).
    - `nutrient_name_standard` – canonical ID (e.g. `vitamin_c`).
    - `amount` – numeric value.
    - `unit` – normalised unit (`g`, `mg`, `µg`, `IU`, `kcal`, `percent_dv`, `unknown`).
  - Name normalisation (`web/lib/nutrition/normalization.ts`):
    - Maps common variants, for example:
      - `Vitamin C`, `Ascorbic Acid` → `vitamin_c`.
      - `Thiamine Mononitrate` → `vitamin_b1`.
      - `Pyridoxine HCL` → `vitamin_b6`.
      - `Total Fat` → `total_fat`, `Dietary Fiber`/`Fiber` → `dietary_fiber`.
    - Falls back to `unknown` for unmapped names.
  - Unit normalisation:
    - `milligrams` / `milligram` / `mg` → `mg`.
    - `grams` / `gram` / `g` → `g`.
    - `mcg` / `µg` / `micrograms` → `µg`.
    - `IU` → `IU`.
    - `calories` / `cal` → `kcal`.
    - `%` / `%DV` → `percent_dv`.
    - Everything else → `unknown`.

- Parsing strategy
  - Implemented in `web/lib/nutrition/parser.ts`.
  - Treats OCR output as line-oriented text, skips headers such as `Nutrition Facts`, `Supplement Facts`, `Serving Size`, `Ingredients`.
  - Uses a simple regex to extract:
    - Nutrient name.
    - Numeric amount.
    - Optional unit.
  - Only keeps lines that match the expected shape; others are ignored rather than guessed.

- OCR layer (simulated)
  - A production setup would use a real OCR engine (e.g. Tesseract or a cloud OCR API).
  - For this take‑home, `extractTextFromImage`:
    - Derives a “pseudo-OCR” text block from the filename (`product_01`, `product_02`, `product_03`).
    - Returns deterministic, realistic-looking lines like:
      - `Protein 24 g`
      - `Vitamin C 60 mg`
      - `Ascorbic Acid 120 milligrams`
      - `Thiamine Mononitrate 1.5 mg`
      - `Total Carbohydrate 23 grams`, etc.
  - This exercises the parser and normalisers without relying on fragile native binaries.

## What you decided not to build — and why

- Real OCR integration (Tesseract / cloud services)
  - Initial attempts with `tesseract.js` caused environment-specific native module issues on Windows.
  - Given the limited time and the assignment’s emphasis on tradeoffs, I:
    - Removed live OCR from the runtime path.
    - Kept a clear OCR abstraction (`extractTextFromImage`) that could be swapped for real OCR later.
    - Used deterministic pseudo-OCR output so the rest of the system can still be evaluated end-to-end.

- Complex layout/table recognition
  - Real labels use multi-column tables, nested headers, and footnotes.
  - Robust table detection and layout-aware parsing would require significant extra work (vision models, bounding boxes, etc.).
  - I assumed OCR provides text lines in reading order and focused on **line-level parsing** of `name amount unit` rows.

- %DV semantics and serving size normalisation
  - I did not attempt to derive `% Daily Value` from amounts or vice versa.
  - `%` and `%DV` are normalised to the unit `percent_dv`, but the parser does not interpret nutritional guidelines.
  - I also avoided normalising values to a specific basis (e.g. per 100 g) to avoid encoding hidden assumptions.

- Huge nutrient ontology and conversions
  - I implemented a small but realistic mapping for key macros and a handful of vitamins/minerals.
  - I did not:
    - Cover every possible micronutrient and synonym.
    - Implement unit conversions (e.g. `IU` ↔ `mg`) where domain-specific factors are needed.
  - Instead, anything outside the core map is labelled `unknown`, which is explicit and safe.

- Feature-rich UI
  - UI is intentionally minimal:
    - Single page.
    - One button to run the parser.
    - Simple readout of row count, processed images, and CSV path.
  - I skipped:
    - In-browser table views of results.
    - CSV download links (file is written to disk).
    - Advanced UX like per-image drilldowns or filters.

## The hardest part — what was genuinely ambiguous and how you resolved it

- Choosing the right boundary around OCR
  - The ambiguous question was: “How much effort should go into real OCR vs. the parsing system itself?”
  - Running real OCR in this environment risked sinking time into platform issues that don’t teach much about my design decisions.
  - I resolved this by:
    - Designing a clean OCR interface (`extractTextFromImage`) that can later call Tesseract or an API.
    - Implementing deterministic pseudo-OCR output now so all parsing and normalisation code works as if OCR were real.
    - Documenting this tradeoff clearly in the README.

- Schema design under open-ended requirements
  - Nutrition data can be modelled in many ways; the brief only gives an example table.
  - I kept the core schema close to the example (`product_image`, raw name, standard name, amount, unit) and added only an `unknown` catch-all for names/units.
  - This keeps the model simple enough for the assignment but still realistic and extendable.

- Normalisation vs. overfitting
  - It’s easy to either:
    - Hard-code a bunch of mappings that only work on these specific labels, or
    - Be so conservative that nothing ever normalises.
  - I picked a middle ground:
    - A small, explicit lookup table with clear, testable entries derived from the examples and pseudo-OCR.
    - A default `unknown` bucket.
    - A normalisation implementation that’s trivial to grow as new labels appear.

## What you'd do next with more time

- Integrate real OCR
  - Replace the pseudo-OCR with:
    - Tesseract (CLI or `tesseract.js` in a worker) with tuned configs, or
    - A hosted OCR API behind the same `extractTextFromImage` function.
  - Add metrics and logging around OCR confidence and error types.

- Richer parsing
  - Handle:
    - Lines containing both grams and `%DV`.
    - Multi-part descriptions (e.g. “Includes X g Added Sugars”).
    - Multi-line nutrients and footnotes.
  - Potentially augment the rule-based parser with an LLM-backed fallback for ambiguous rows.

- Expand normalisation and domain model
  - Broaden the nutrient dictionary (more vitamins, minerals, amino acids, fatty acids).
  - Introduce higher-level categories (macros, micros, additives) for analysis.
  - Add optional unit conversions where safe and well-defined.

- Improve UX and observability
  - Show parsed results in the browser with filters/search.
  - Expose a way to download the CSV directly.
  - Add a developer/debug view showing:
    - Raw OCR text per image.
    - Which lines were parsed or skipped and why.

- Scale up
  - Run OCR and parsing concurrently for large image sets.
  - Persist intermediate OCR outputs so schema/normalisation experiments don’t require re-OCR.
  - Potentially split into separate services for OCR, parsing, and data storage if volume grows.

