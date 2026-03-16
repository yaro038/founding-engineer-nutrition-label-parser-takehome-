import { normalizeNutrientName, normalizeUnit } from "./normalization";
import type { ParsedNutrientRow } from "./types";

const NUTRIENT_LINE_REGEX =
  /^(?<name>[A-Za-z][A-Za-z0-9\s\-\(\)%]+?)\s+(?<amount>\d+(?:\.\d+)?)\s*(?<unit>[a-zA-Zµ%]+)?/;

export function parseNutritionText(productImage: string, text: string): ParsedNutrientRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ParsedNutrientRow[] = [];

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes("nutrition facts") ||
      lower.includes("supplement facts") ||
      lower.startsWith("serving size") ||
      lower.includes("ingredients")
    ) {
      continue;
    }

    const match = line.match(NUTRIENT_LINE_REGEX);
    if (!match || !match.groups) continue;

    const { name, amount, unit } = match.groups as {
      name: string;
      amount: string;
      unit?: string;
    };

    const numericAmount = Number.parseFloat(amount);
    if (!Number.isFinite(numericAmount)) continue;

    const normalizedName = normalizeNutrientName(name);
    const normalizedUnit = normalizeUnit(unit);

    rows.push({
      productImage,
      nutrientNameRaw: name.trim(),
      nutrientNameStandard: normalizedName,
      amount: numericAmount,
      unit: normalizedUnit,
    });
  }

  return rows;
}

