"use client";

import { useEffect, useState } from "react";
import MnavChart from "@/components/MnavChart";
import BtcChart from "@/components/BtcChart";

export default function HomePage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState<string>("Loading AI summary...");
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Fetch main dashboard data
  useEffect(() => {
    fetch("/api/data")
      .then((res) => res.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load data");
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch AI-generated summary only after data is ready
  useEffect(() => {
    if (data.length === 0) return;

    const fetchSummary = async () => {
      try {
        setSummaryLoading(true);

        const response = await fetch("/api/summary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            data: data.slice(-10),
          }),
        });

        const text = await response.text();

        if (!text) {
          throw new Error("Empty response from /api/summary");
        }

        let result: any;
        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(`Invalid JSON response: ${text}`);
        }

        if (!response.ok) {
          throw new Error(result.error || result.summary || "Summary request failed");
        }

        setSummary(result.summary || "No summary generated.");
      } catch (err: any) {
        setSummary("Fetch error: " + err.message);
        console.error(err);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [data]);

  const latest = data.length > 0 ? data[data.length - 1] : null;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-slate-900 text-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold">MSTR mNAV Dashboard</h1>
          <p className="mt-2 text-slate-200">
            Monitor MSTR mNAV alongside Bitcoin price and MSTR stock price.
          </p>
          <p className="mt-3 text-sm text-slate-300">
            Formula: mNAV = Market Cap / (BTC Holdings × BTC Price)
          </p>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-slate-700">Loading data...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-700 font-medium">Error: {error}</p>
          </div>
        )}

        {!loading && !error && latest && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-slate-500">Latest BTC Price</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${latest.btcPrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-slate-500">Latest MSTR Close</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${latest.mstrClose.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-slate-500">Latest BTC NAV</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                ${Math.round(latest.btcNav).toLocaleString()}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <p className="text-sm text-slate-500">Latest mNAV</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {latest.mnav.toFixed(2)}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                What does mNAV mean?
              </h2>
              <p className="text-slate-700 leading-7">
                mNAV compares MSTR’s estimated market value with the value of its
                Bitcoin holdings. A value above 1 means the stock is trading at a
                premium to its Bitcoin NAV. A value below 1 means it is trading at
                a discount.
              </p>
            </div>

            <MnavChart data={data} />
            <BtcChart data={data} />

            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                AI-Generated Summary
              </h2>
              {summaryLoading ? (
                <p className="text-slate-500 italic">Generating summary...</p>
              ) : (
                <p className="text-slate-700 leading-7">{summary}</p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}