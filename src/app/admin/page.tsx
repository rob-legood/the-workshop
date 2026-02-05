"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { AdminDataTable } from "@/components/admin-data-table";
import { CreateWorkshopForm } from "@/components/create-workshop-form";

interface Presentation {
  id: string;
  title: string;
  name: string;
  email: string;
  department: { id: string; name: string };
  minutes: number;
  createdAt: string;
}

interface Workshop {
  id: string;
  chair: string;
  date: string;
  maxMinutes: number;
  presentations: Presentation[];
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [metricsYear, setMetricsYear] = useState<string>("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchWorkshops = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/workshops");
    const data = await res.json();
    setWorkshops(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authenticated) return;
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      const res = await fetch("/api/workshops");
      const data = await res.json();
      if (!cancelled) {
        setWorkshops(data);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/settings?key=metricsYear")
      .then((res) => res.json())
      .then((setting) => {
        setMetricsYear(setting?.value || String(new Date().getFullYear()));
      });
  }, [authenticated]);

  async function handleSaveMetricsYear() {
    setSavingSettings(true);
    await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "metricsYear", value: metricsYear }),
    });
    setSavingSettings(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    const data = await res.json();
    if (data.authenticated) {
      setAuthenticated(true);
    } else {
      setError(data.error || "Invalid PIN");
    }
  }

  if (!authenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter the admin PIN to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">PIN</Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Log In
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage workshops and view presentations.
            </p>
          </div>
          <Button variant="outline" onClick={() => setAuthenticated(false)}>
            Log Out
          </Button>
        </div>

        <div className="mb-8">
          <CreateWorkshopForm
            onCreated={fetchWorkshops}
            workshop={editingWorkshop}
            onCancel={() => setEditingWorkshop(null)}
          />
        </div>

        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label htmlFor="metricsYear">Default Metrics Year</Label>
                  <Select value={metricsYear} onValueChange={setMetricsYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 6 }, (_, i) => {
                        const year = String(new Date().getFullYear() - i);
                        return (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleSaveMetricsYear}
                  disabled={savingSettings}
                >
                  {savingSettings ? "Saving..." : "Save"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <h2 className="mb-4 text-xl font-semibold">
          Workshops &amp; Presentations
        </h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <AdminDataTable workshops={workshops} onEdit={setEditingWorkshop} />
        )}
      </div>
    </main>
  );
}
