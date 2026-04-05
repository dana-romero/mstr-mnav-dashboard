import { NextResponse } from "next/server";
import { fetchBtcHistory } from "@/lib/fetchBtc";
import { fetchMstrDaily } from "@/lib/fetchMstr";
import { buildMnavSeries } from "@/lib/calc";

export async function GET() {
  try {
    const [btcData, mstrData] = await Promise.all([
      fetchBtcHistory(90),
      fetchMstrDaily(),
    ]);

    const merged = buildMnavSeries(btcData, mstrData);

    return NextResponse.json(merged);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}