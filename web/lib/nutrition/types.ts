export type NormalizedNutrientName =
  | "protein"
  | "vitamin_c"
  | "vitamin_b1"
  | "vitamin_b6"
  | "calcium"
  | "iron"
  | "total_fat"
  | "saturated_fat"
  | "trans_fat"
  | "cholesterol"
  | "sodium"
  | "total_carbohydrate"
  | "dietary_fiber"
  | "total_sugars"
  | "added_sugars"
  | "potassium"
  | "unknown";

export type StandardUnit = "g" | "mg" | "µg" | "IU" | "kcal" | "percent_dv" | "unknown";

export interface ParsedNutrientRow {
  productImage: string;
  nutrientNameRaw: string;
  nutrientNameStandard: NormalizedNutrientName;
  amount: number | null;
  unit: StandardUnit;
}

export interface ParseResult {
  rows: ParsedNutrientRow[];
  rawTextByImage: Record<string, string>;
}

