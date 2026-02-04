"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WorkshopCard } from "@/components/workshop-card";

interface Workshop {
  id: string;
  chair: string;
  date: string;
  maxMinutes: number;
  presentations: {
    id: string;
    title: string;
    description: string;
    name: string;
    email: string;
    department: { id: string; name: string };
    minutes: number;
  }[];
}

export default function PastWorkshopsPage() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkshops = useCallback(async () => {
    const res = await fetch("/api/workshops");
    const data = await res.json();
    setWorkshops(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkshops();
  }, [fetchWorkshops]);

  const pastWorkshops = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return workshops
      .filter((w) => {
        const d = new Date(w.date);
        d.setHours(0, 0, 0, 0);
        return d < now;
      })
      .reverse();
  }, [workshops]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Past Workshops</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse previous workshops and view feedback.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading workshops...
          </p>
        ) : pastWorkshops.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No past workshops yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {pastWorkshops.map((workshop) => (
              <div key={workshop.id}>
                <WorkshopCard workshop={workshop} onSignup={fetchWorkshops} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
