"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SignupForm } from "@/components/signup-form";

interface SlotCardProps {
  slot: {
    id: string;
    title: string;
    description: string;
    date: string;
    maxAttendees: number;
    signups: { id: string }[];
  };
  onSignup: () => void;
}

export function SlotCard({ slot, onSignup }: SlotCardProps) {
  const spotsLeft = slot.maxAttendees - slot.signups.length;
  const isFull = spotsLeft <= 0;
  const dateStr = new Date(slot.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{slot.title}</CardTitle>
            <CardDescription className="mt-1">{dateStr}</CardDescription>
          </div>
          <Badge variant={isFull ? "destructive" : "secondary"}>
            {isFull ? "Full" : `${spotsLeft} spots left`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{slot.description}</p>
      </CardContent>
      <CardFooter>
        <SignupForm
          slotId={slot.id}
          slotTitle={slot.title}
          disabled={isFull}
          onSuccess={onSignup}
        />
      </CardFooter>
    </Card>
  );
}
