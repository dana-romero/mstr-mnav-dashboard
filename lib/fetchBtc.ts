export async function fetchBtcHistory(days = 90) {
  const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`;

  const response = await fetch(url, {
    next: { revalidate: 60 * 60 * 6 }, // cache for 6 hours
  });

  if (!response.ok) {
    throw new Error("Failed to fetch BTC history");
  }

  const data = await response.json();

  return data.prices.map((item: [number, number]) => {
    const [timestamp, price] = item;
    const date = new Date(timestamp).toISOString().split("T")[0];

    return {
      date,
      btcPrice: price,
    };
  });
}