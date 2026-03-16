import { NextResponse } from "next/server";
import { runNutritionParsingPipeline } from "@/lib/pipeline";

export async function POST() {
  try {
    const result = await runNutritionParsingPipeline();

    return NextResponse.json(
      {
        success: true,
        rowCount: result.rowCount,
        processedImages: result.processedImages,
        outputPath: result.outputPath,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Parsing pipeline failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run nutrition parsing pipeline.",
      },
      { status: 500 },
    );
  }
}

