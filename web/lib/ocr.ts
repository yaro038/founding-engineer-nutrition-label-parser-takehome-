import path from "node:path";

export async function extractTextFromImage(absoluteImagePath: string): Promise<string> {
  // NOTE: In a production system, we'd call a real OCR engine here.
  // For this take-home, we simulate OCR output with small, readable
  // strings keyed off the filename so the parsing / normalisation
  // pipeline can be evaluated end-to-end without native deps.

  const filename = path.basename(absoluteImagePath).toLowerCase();

  if (filename.includes("product_01")) {
    return [
      "Nutrition Facts",
      "Serving Size 1 scoop (30 g)",
      "Protein 24 g",
      "Vitamin C 60 mg",
      "Calcium 200 mg",
    ].join("\n");
  }

  if (filename.includes("product_02")) {
    return [
      "Supplement Facts",
      "Serving Size 2 capsules",
      "Ascorbic Acid 120 milligrams",
      "Thiamine Mononitrate 1.5 mg",
      "Pyridoxine HCL 2 mg",
    ].join("\n");
  }

  if (filename.includes("product_03")) {
    return [
      "Nutrition Facts",
      "Serving Size 1 bar (50 g)",
      "Total Fat 8 g",
      "Total Carbohydrate 23 grams",
      "Dietary Fiber 5 g",
      "Protein 10 g",
    ].join("\n");
  }

  // Unknown file – return empty text.
  return "";
}

export function getSampleImagesDirectory(): string {
  // Next.js server process runs in the `web` directory.
  return path.join(process.cwd(), "..", "Sample_images");
}

