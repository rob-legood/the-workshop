"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface EditableWorkshop {
  id: string;
  chair: string;
  date: string;
  maxMinutes: number;
}

interface CreateWorkshopFormProps {
  onCreated: () => void;
  workshop?: EditableWorkshop | null;
  onCancel?: () => void;
}

export function CreateWorkshopForm({
  onCreated,
  workshop,
  onCancel,
}: CreateWorkshopFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!workshop;

  function formatDateForInput(dateStr: string) {
    const d = new Date(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      chair: formData.get("chair") as string,
      date: formData.get("date") as string,
      maxMinutes: Number(formData.get("maxMinutes")) || 35,
    };

    const url = isEditing
      ? `/api/workshops/${workshop.id}`
      : "/api/workshops";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || `Failed to ${isEditing ? "save" : "create"} workshop`);
      setLoading(false);
      return;
    }

    setLoading(false);
    (e.target as HTMLFormElement).reset();
    onCreated();
    if (isEditing) onCancel?.();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Workshop" : "Create New Workshop"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          key={workshop?.id ?? "new"}
          onSubmit={handleSubmit}
          className="grid gap-4 sm:grid-cols-3"
        >
          <div className="space-y-2">
            <Label htmlFor="chair">Chair</Label>
            <Input
              id="chair"
              name="chair"
              required
              placeholder="e.g. Jane Doe"
              defaultValue={workshop?.chair ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date & Time</Label>
            <Input
              id="date"
              name="date"
              type="datetime-local"
              required
              defaultValue={
                workshop ? formatDateForInput(workshop.date) : ""
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxMinutes">Max Minutes</Label>
            <Input
              id="maxMinutes"
              name="maxMinutes"
              type="number"
              defaultValue={workshop?.maxMinutes ?? 35}
              min={1}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive sm:col-span-3">{error}</p>
          )}
          <div className="flex gap-2 sm:col-span-3">
            <Button type="submit" disabled={loading}>
              {isEditing
                ? loading
                  ? "Saving..."
                  : "Save Workshop"
                : loading
                  ? "Creating..."
                  : "Create Workshop"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
