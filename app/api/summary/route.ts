import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

async function generateSummary(prompt: string): Promise<string> {
  const message = await client.messages.create({
    model: "claude-haiku-4-5",   // cheapest + fastest
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type");
  return block.text.trim();
}

export async function POST(req: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY in .env.local" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || !Array.isArray(body.data) || body.data.length === 0) {
      return NextResponse.json(
        { error: "No valid data provided for summary." },
        { status: 400 }
      );
    }

    const latest = body.data.slice(-10);
    const formattedData = latest
      .map(
        (row: any) =>
          `Date: ${row.date}, BTC Price: ${Number(row.btcPrice).toFixed(2)} USD, ` +
          `MSTR Close: ${Number(row.mstrClose).toFixed(2)} USD, mNAV: ${Number(row.mnav).toFixed(4)}`
      )
      .join("\n");

    const prompt = `
You are a financial analysis assistant.

Below is recent daily data for the DAT.co-related indicator mNAV for MSTR.

${formattedData}

Write a concise 2-3 sentence summary that:
- explains the recent trend in mNAV,
- provides interpretation or trend analysis,
- briefly explains how the indicator appears to relate to BTC price.

Use clear and professional financial language.
Do not just repeat the raw values line by line.
`.trim();

    const summary = await generateSummary(prompt);
    return NextResponse.json({ summary });

  } catch (error: any) {
    console.error("Anthropic summary error:", error);
    return NextResponse.json({
      summary: "AI summary temporarily unavailable. Please try again.",
    });
  }
}