"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MetricData {
  department: string;
  departmentId: string;
  presentations: number;
}

interface MetricsResponse {
  year: number;
  data: MetricData[];
  total: number;
}

const CHART_COLORS = [
  "oklch(0.646 0.222 41.116)",
  "oklch(0.6 0.118 184.704)",
  "oklch(0.398 0.07 227.392)",
  "oklch(0.828 0.189 84.429)",
  "oklch(0.769 0.188 70.08)",
];

const CURRENT_YEAR = String(new Date().getFullYear());

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>(CURRENT_YEAR);
  const [configuredYear, setConfiguredYear] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      const [metricsRes, settingsRes] = await Promise.all([
        fetch(`/api/metrics?year=${CURRENT_YEAR}`),
        fetch("/api/settings?key=metricsYear"),
      ]);

      if (cancelled) return;

      const metricsData = await metricsRes.json();
      setMetrics(metricsData);
      setLoading(false);

      const setting = await settingsRes.json();
      if (setting?.value) {
        setConfiguredYear(setting.value);
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleYearChange(year: string) {
    setSelectedYear(year);
    setLoading(true);
    fetch(`/api/metrics?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      });
  }

  const yearOptions = Array.from({ length: 6 }, (_, i) =>
    String(Number(CURRENT_YEAR) - i)
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Metrics</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Presentations by department
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Presentations by Team</CardTitle>
                <CardDescription>
                  {metrics
                    ? `${metrics.total} total presentations in ${metrics.year}`
                    : "Loading..."}
                </CardDescription>
              </div>
              <Select value={selectedYear} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                      {year === configuredYear && " (default)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">Loading metrics...</p>
              </div>
            ) : metrics && metrics.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={metrics.data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="department"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 12 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Bar dataKey="presentations" radius={[4, 4, 0, 0]}>
                    {metrics.data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[400px] items-center justify-center">
                <p className="text-muted-foreground">
                  No presentations found for {selectedYear}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
