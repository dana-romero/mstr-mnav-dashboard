export async function fetchMstrDaily() {
  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("Missing ALPHAVANTAGE_API_KEY in .env.local");
  }

  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=MSTR&outputsize=compact&apikey=${apiKey}`;
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to fetch MSTR daily data");
  }

  const data = await response.json();

  const series = data["Time Series (Daily)"];

  if (!series) {
    console.log(data);
    throw new Error("Unexpected Alpha Vantage response");
  }

  return Object.entries(series).map(([date, values]: [string, any]) => ({
    date,
    mstrClose: Number(values["4. close"]),
  }));
}