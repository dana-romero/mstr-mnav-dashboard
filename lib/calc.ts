const BTC_HOLDINGS = 528185;
const SHARES_OUTSTANDING = 244000000;

type BtcRow = {
  date: string;
  btcPrice: number;
};

type MstrRow = {
  date: string;
  mstrClose: number;
};

export function buildMnavSeries(btcData: BtcRow[], mstrData: MstrRow[]) {
  const mstrMap = new Map(mstrData.map((row) => [row.date, row]));

  const merged = btcData
    .filter((row) => mstrMap.has(row.date))
    .map((row) => {
      const mstr = mstrMap.get(row.date)!;

      const btcNav = BTC_HOLDINGS * row.btcPrice;
      const marketCap = SHARES_OUTSTANDING * mstr.mstrClose;
      const mnav = marketCap / btcNav;

      return {
        date: row.date,
        btcPrice: row.btcPrice,
        mstrClose: mstr.mstrClose,
        btcNav,
        marketCap,
        mnav,
      };
    });

  return merged.sort((a, b) => a.date.localeCompare(b.date));
}