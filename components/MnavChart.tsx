"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

export default function MnavChart({ data }: { data: any[] }) {
  return (
    <div className="w-full bg-white rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-slate-900">
        MSTR mNAV Over Time
      </h2>

      <div className="w-full min-w-[300px] h-[420px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
          minWidth={300}
          minHeight={300}
          initialDimension={{ width: 520, height: 420 }}
        >
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" minTickGap={30} />
            <YAxis />
            <Tooltip />
            <ReferenceLine y={1} stroke="red" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="mnav" dot={false} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}