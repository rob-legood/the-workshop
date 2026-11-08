"use client";

import { LIMITS, MINUTES } from "@/lib/limits";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Department {
  id: string;
  name: string;
}

interface EditablePresentation {
  id: string;
  title: string;
  description: string;
  name: string;
  email: string;
  department: { id: string; name: string };
  minutes: number;
}

interface PresentationFormProps {
  workshopId: string;
  workshopDate: string;
  disabled?: boolean;
  onSuccess: () => void;
  presentation?: EditablePresentation | null;
  trigger?: React.ReactNode;
}

export function PresentationForm({
  workshopId,
  workshopDate,
  disabled,
  onSuccess,
  presentation,
  trigger,
}: PresentationFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState(
    presentation?.department?.id ?? ""
  );

  const isEditing = !!presentation;

  useEffect(() => {
    if (open && departments.length === 0) {
      fetch("/api/departments")
        .then((res) => res.json())
        .then((data) => setDepartments(data));
    }
  }, [open, departments.length]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setDepartmentId(presentation?.department?.id ?? "");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [presentation?.department?.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      departmentId,
      minutes: Number(formData.get("minutes")) || 5,
    };

    if (!departmentId) {
      setError("Please select a department");
      setLoading(false);
      return;
    }

    const url = isEditing
      ? `/api/workshops/${workshopId}/presentations/${presentation.id}`
      : `/api/workshops/${workshopId}/presentations`;
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.error || "Something went wrong");
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    if (!isEditing) setDepartmentId("");
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button disabled={disabled}>
            {disabled ? "Workshop Full" : "Sign Up"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Presentation" : `Sign up for ${workshopDate}`}
          </DialogTitle>
        </DialogHeader>
        <form
          key={presentation?.id ?? "new"}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Presentation Title</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={LIMITS.title}
              placeholder="e.g. Intro to GraphQL"
              defaultValue={presentation?.title ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              required
              maxLength={LIMITS.description}
              placeholder="Brief description of your presentation"
              defaultValue={presentation?.description ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              maxLength={LIMITS.name}
              placeholder="Your full name"
              defaultValue={presentation?.name ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              maxLength={LIMITS.email}
              placeholder="you@company.com"
              defaultValue={presentation?.email ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="minutes">Presentation Length (minutes)</Label>
            <Input
              id="minutes"
              name="minutes"
              type="number"
              defaultValue={presentation?.minutes ?? 5}
              min={MINUTES.min}
              max={MINUTES.max}
              required
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {isEditing
              ? loading
                ? "Saving..."
                : "Save Changes"
              : loading
                ? "Submitting..."
                : "Submit Presentation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
