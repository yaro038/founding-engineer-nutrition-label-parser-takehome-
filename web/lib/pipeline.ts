import fs from "node:fs/promises";
import path from "node:path";
import { extractTextFromImage, getSampleImagesDirectory } from "./ocr";
import { parseNutritionText } from "./nutrition/parser";
import type { ParsedNutrientRow } from "./nutrition/types";

function toCsv(rows: ParsedNutrientRow[]): string {
  const header = [
    "product_image",
    "nutrient_name_raw",
    "nutrient_name_standard",
    "amount",
    "unit",
  ].join(",");

  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    const str = String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = rows.map((row) =>
    [
      escape(row.productImage),
      escape(row.nutrientNameRaw),
      escape(row.nutrientNameStandard),
      escape(row.amount),
      escape(row.unit),
    ].join(","),
  );

  return [header, ...lines].join("\n");
}

export async function runNutritionParsingPipeline(): Promise<{
  csv: string;
  outputPath: string;
  rowCount: number;
  processedImages: string[];
}> {
  const sampleDir = getSampleImagesDirectory();
  const entries = await fs.readdir(sampleDir, { withFileTypes: true });
  const imageFiles = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => /\.(png|jpe?g|webp)$/i.test(name));

  const allRows: ParsedNutrientRow[] = [];
  const processedImages: string[] = [];

  for (const file of imageFiles) {
    const absolutePath = path.join(sampleDir, file);
    const text = await extractTextFromImage(absolutePath);
    const rows = parseNutritionText(file, text);

    if (rows.length > 0) {
      processedImages.push(file);
      allRows.push(...rows);
    }
  }

  const csv = toCsv(allRows);

  const outputDir = path.join(process.cwd(), "..", "output");
  const outputPath = path.join(outputDir, "nutrition_data.csv");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputPath, csv, "utf8");

  return {
    csv,
    outputPath,
    rowCount: allRows.length,
    processedImages,
  };
}

