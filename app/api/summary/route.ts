import { NextResponse } from "next/server";
import fetch from "node-fetch"; // only needed if your Node version lacks fetch
import { fetchBtcHistory } from "@/lib/fetchBtc";
import { fetchMstrDaily } from "@/lib/fetchMstr";
import { buildMnavSeries } from "@/lib/calc";

const HUGGINGFACE_TOKEN = process.env.HF_API_KEY; // your HF token
const MODEL = "google/flan-t5-small"; // a small summarization model

export async function GET() {
  try {
    const [btcData, mstrData] = await Promise.all([
      fetchBtcHistory(90),
      fetchMstrDaily(),
    ]);

    const merged = buildMnavSeries(btcData, mstrData);

    // Prepare a simple text input for the model
    const inputText = `Summarize the following financial data in 2-3 sentences:\n${JSON.stringify(
      merged.slice(-10)
    )}`;

    // Hugging Face Inference API call
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

    const result = await response.json();

    // result might be an array of generated text
    const summary =
      result[0]?.generated_text ??
      "No summary generated from Hugging Face.";

    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}