// lib/fetchMstr.ts

export type MstrRow = {
  date: string;
  mstrClose: number;
};

export async function fetchMstrDaily(): Promise<MstrRow[]> {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ALPHAVANTAGE_API_KEY");
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSTR&outputsize=compact&apikey=${apiKey}`;

  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 },
    
  });

  if (!response.ok) {
    throw new Error(`Alpha Vantage request failed: ${response.status}`);
  }

  const data = await response.json();

  if (data.Note || data.Information) {
    throw new Error("Alpha Vantage rate limit reached. Try again later.");
  }

  if (data["Error Message"]) {
    throw new Error(`Alpha Vantage error: ${data["Error Message"]}`);
  }

  const series = data["Time Series (Daily)"];

  if (!series) {
    throw new Error("Unexpected Alpha Vantage response format.");
  }

  const parsed = Object.entries(series).map(([date, values]: [string, any]) => ({
    date,
    mstrClose: Number(values["4. close"]),
  }));

  return parsed.sort((a, b) => a.date.localeCompare(b.date));
}