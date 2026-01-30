"use client";

import { useCallback, useEffect, useState } from "react";
import { SlotCard } from "@/components/slot-card";

interface Slot {
  id: string;
  title: string;
  description: string;
  date: string;
  maxAttendees: number;
  signups: { id: string }[];
}

export default function HomePage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSlots = useCallback(async () => {
    const res = await fetch("/api/slots");
    const data = await res.json();
    setSlots(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">The Workshop</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Presentation Signup &mdash; Browse available demo slots and reserve your spot.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No demo slots available yet. Check back soon!
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {slots.map((slot) => (
              <SlotCard key={slot.id} slot={slot} onSignup={fetchSlots} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
