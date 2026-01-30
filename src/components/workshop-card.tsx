"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PresentationForm } from "@/components/presentation-form";
import { Pencil, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

interface Feedback {
  id: string;
  name: string;
  text: string;
  createdAt: string;
}

function FeedbackDialog({
  workshopId,
  presentation,
  dateStr,
}: {
  workshopId: string;
  presentation: PresentationSummary;
  dateStr: string;
}) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  function handleOpen(open: boolean) {
    if (!open) return;
    setLoading(true);
    fetch(
      `/api/workshops/${workshopId}/presentations/${presentation.id}/feedback`
    )
      .then((res) => res.json())
      .then((data) => setFeedbacks(data))
      .finally(() => setLoading(false));
  }

  return (
    <Dialog onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex shrink-0 text-muted-foreground hover:text-foreground"
        >
          <MessageSquare size={14} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{presentation.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {presentation.name} &middot; {presentation.department.name} &middot;{" "}
            {dateStr}
          </p>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading feedback...</p>
          ) : feedbacks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No feedback yet.</p>
          ) : (
            <ul className="space-y-3">
              {feedbacks.map((f) => (
                <li key={f.id} className="border-b pb-3 last:border-b-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function WorkshopCard({ workshop, onSignup, featured }: WorkshopCardProps) {
  const usedMinutes = workshop.presentations.reduce(
    (sum, p) => sum + p.minutes,
    0
  );
  const minutesLeft = workshop.maxMinutes - usedMinutes;
  const isFull = minutesLeft <= 0;
  const workshopDate = new Date(workshop.date);
  const dateStr = workshopDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  workshopDate.setHours(0, 0, 0, 0);
  const isPast = workshopDate <= today;

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
                {isPast && (
                  <FeedbackDialog
                    workshopId={workshop.id}
                    presentation={p}
                    dateStr={dateStr}
                  />
                )}
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
