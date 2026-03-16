"use client";

import { useState } from "react";

interface ParseResponse {
  success: boolean;
  rowCount?: number;
  processedImages?: string[];
  outputPath?: string;
  error?: string;
}

export default function Home() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<ParseResponse | null>(null);

  const handleRunPipeline = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/parse", { method: "POST" });
      const json = (await res.json()) as ParseResponse;
      setResult(json);
    } catch (error) {
      setResult({
        success: false,
        error: "Request failed. Check the server logs.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-10 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <main className="mx-auto flex max-w-4xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Product Label Nutrition Parser
          </h1>
          <p className="max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
            This Next.js app scans the <code>Sample_images/</code> folder, runs OCR on each image,
            parses nutrient rows, normalises names and units, and writes{" "}
            <code>output/nutrition_data.csv</code> at the repository root.
          </p>
        </header>

        <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h2 className="text-lg font-medium">Run pipeline</h2>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Make sure your sample label images are in the <code>Sample_images/</code> directory
            (sibling to <code>web/</code>), then click the button below.
          </p>

          <button
            type="button"
            onClick={handleRunPipeline}
            disabled={isRunning}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isRunning ? "Running parser..." : "Run nutrition parser"}
          </button>

          {result && (
            <div className="mt-4 rounded-lg bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
              {result.success ? (
                <div className="space-y-1">
                  <p className="font-medium text-emerald-600 dark:text-emerald-400">
                    Success: parsed {result.rowCount ?? 0} rows.
                  </p>
                  {result.processedImages && result.processedImages.length > 0 && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      Processed images: {result.processedImages.join(", ")}
                    </p>
                  )}
                  {result.outputPath && (
                    <p className="text-zinc-600 dark:text-zinc-400">
                      CSV written to: <code>{result.outputPath}</code>
                    </p>
                  )}
                </div>
              ) : (
                <p className="font-medium text-red-600 dark:text-red-400">
                  {result.error ?? "Pipeline failed."}
                </p>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

