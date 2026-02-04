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

export default function HomePage() {
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

  const futureWorkshops = useMemo(
    () => workshops.filter((w) => new Date(w.date) > new Date()),
    [workshops]
  );

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Upcoming Workshops</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Browse upcoming workshops and sign up to present.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading workshops...
          </p>
        ) : futureWorkshops.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No upcoming workshops. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {futureWorkshops.map((workshop, i) => (
              <div
                key={workshop.id}
                className={i === 0 ? "sm:col-span-2" : ""}
              >
                <WorkshopCard
                  workshop={workshop}
                  onSignup={fetchWorkshops}
                  featured={i === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
