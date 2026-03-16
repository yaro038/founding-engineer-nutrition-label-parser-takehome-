import type { NormalizedNutrientName, StandardUnit } from "./types";

const NUTRIENT_NAME_MAP: Record<string, NormalizedNutrientName> = {
  protein: "protein",
  "total protein": "protein",
  "vitamin c": "vitamin_c",
  "ascorbic acid": "vitamin_c",
  "thiamine mononitrate": "vitamin_b1",
  "vitamin b1": "vitamin_b1",
  "pyridoxine hcl": "vitamin_b6",
  "vitamin b6": "vitamin_b6",
  calcium: "calcium",
  iron: "iron",
  "total fat": "total_fat",
  "saturated fat": "saturated_fat",
  "trans fat": "trans_fat",
  cholesterol: "cholesterol",
  sodium: "sodium",
  "total carbohydrate": "total_carbohydrate",
  "dietary fiber": "dietary_fiber",
  fiber: "dietary_fiber",
  "total sugars": "total_sugars",
  sugars: "total_sugars",
  "added sugars": "added_sugars",
  potassium: "potassium",
};

const UNIT_MAP: Record<string, StandardUnit> = {
  g: "g",
  gram: "g",
  grams: "g",
  mg: "mg",
  milligram: "mg",
  milligrams: "mg",
  mcg: "µg",
  "µg": "µg",
  microgram: "µg",
  micrograms: "µg",
  iu: "IU",
  "iu.": "IU",
  kcal: "kcal",
  "cal": "kcal",
  "calories": "kcal",
  "%": "percent_dv",
  "%dv": "percent_dv",
};

export function normalizeNutrientName(raw: string): NormalizedNutrientName {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return NUTRIENT_NAME_MAP[key] ?? "unknown";
}

export function normalizeUnit(raw: string | null | undefined): StandardUnit {
  if (!raw) return "unknown";
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return UNIT_MAP[key] ?? "unknown";
}

