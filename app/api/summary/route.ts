// app/api/summary/route.ts
import { NextResponse } from "next/server";
import { fetchBtcHistory } from "@/lib/fetchBtc";
import { fetchMstrDaily } from "@/lib/fetchMstr";
import { buildMnavSeries } from "@/lib/calc";

const HUGGINGFACE_TOKEN = process.env.HF_API_KEY; // your HF API key
const MODEL = "google/flan-t5-small"; // lightweight summarization model

export async function GET() {
  try {
    const [btcData, mstrData] = await Promise.all([
      fetchBtcHistory(90),
      fetchMstrDaily(),
    ]);

    const merged = buildMnavSeries(btcData, mstrData);

    const inputText = `Summarize the following financial data in 2-3 sentences:\n${JSON.stringify(
      merged.slice(-10)
    )}`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: inputText }),
      }
    );

    const result: any = await response.json();

    let summary = "No summary generated from Hugging Face.";
    if (Array.isArray(result) && result[0]?.generated_text) {
      summary = result[0].generated_text;
    } else if (result?.generated_text) {
      summary = result.generated_text;
    } else if (result?.error) {
      summary = `Error from Hugging Face: ${result.error}`;
    }

    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}