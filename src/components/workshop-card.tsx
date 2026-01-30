"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PresentationForm } from "@/components/presentation-form";
import { Pencil } from "lucide-react";

interface PresentationSummary {
  id: string;
  title: string;
  description: string;
  name: string;
  email: string;
  department: { id: string; name: string };
  minutes: number;
}

interface WorkshopCardProps {
  workshop: {
    id: string;
    chair: string;
    date: string;
    maxMinutes: number;
    presentations: PresentationSummary[];
  };
  onSignup: () => void;
  featured?: boolean;
}

export function WorkshopCard({ workshop, onSignup, featured }: WorkshopCardProps) {
  const usedMinutes = workshop.presentations.reduce(
    (sum, p) => sum + p.minutes,
    0
  );
  const minutesLeft = workshop.maxMinutes - usedMinutes;
  const isFull = minutesLeft <= 0;
  const dateStr = new Date(workshop.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card className={featured ? "border-primary ring-1 ring-primary/20" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            {featured && (
              <Badge className="mb-2">Next Up</Badge>
            )}
            <CardTitle>{dateStr}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Chair: {workshop.chair}
            </p>
          </div>
          <Badge variant={isFull ? "destructive" : "secondary"}>
            {isFull ? "Full" : `${minutesLeft} min left`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {workshop.presentations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No presentations yet. Be the first to sign up!
          </p>
        ) : (
          <ul className="space-y-1">
            {workshop.presentations.map((p) => (
              <li key={p.id} className="flex items-center gap-1.5 text-sm">
                <PresentationForm
                  workshopId={workshop.id}
                  workshopDate={dateStr}
                  presentation={p}
                  onSuccess={onSignup}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil size={14} />
                    </button>
                  }
                />
                <span>
                  <span className="font-medium">{p.name}</span>
                  {" \u2014 "}
                  {p.title}
                  <span className="text-muted-foreground">
                    {" "}
                    ({p.minutes} min)
                  </span>
                </span>
                <Badge variant="outline" className="ml-auto shrink-0">
                  {p.department.name}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter>
        <PresentationForm
          workshopId={workshop.id}
          workshopDate={dateStr}
          disabled={isFull}
          onSuccess={onSignup}
        />
      </CardFooter>
    </Card>
  );
}
