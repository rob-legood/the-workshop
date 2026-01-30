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
import { AdminDataTable } from "@/components/admin-data-table";
import { CreateSlotForm } from "@/components/create-slot-form";

interface Signup {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
}

interface Slot {
  id: string;
  title: string;
  date: string;
  maxAttendees: number;
  signups: Signup[];
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSlots = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/slots");
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authenticated) fetchSlots();
  }, [authenticated, fetchSlots]);

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
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Manage demo slots and view attendees.
            </p>
          </div>
          <Button variant="outline" onClick={() => setAuthenticated(false)}>
            Log Out
          </Button>
        </div>

        <div className="mb-8">
          <CreateSlotForm onCreated={fetchSlots} />
        </div>

        <h2 className="mb-4 text-xl font-semibold">Slots &amp; Attendees</h2>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <AdminDataTable slots={slots} />
        )}
      </div>
    </main>
  );
}
