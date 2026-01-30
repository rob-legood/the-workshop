"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

interface AdminDataTableProps {
  workshops: Workshop[];
  onEdit?: (workshop: Workshop) => void;
}

export function AdminDataTable({ workshops, onEdit }: AdminDataTableProps) {
  if (workshops.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No workshops created yet. Use the form above to create one.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {workshops.map((workshop) => {
        const usedMinutes = workshop.presentations.reduce(
          (sum, p) => sum + p.minutes,
          0
        );
        const minutesLeft = workshop.maxMinutes - usedMinutes;
        return (
          <div key={workshop.id} className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-semibold">
                  {new Date(workshop.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Chair: {workshop.chair}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={minutesLeft <= 0 ? "destructive" : "secondary"}>
                  {usedMinutes} / {workshop.maxMinutes} min
                </Badge>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(workshop)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>

            {workshop.presentations.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                No presentations yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Minutes</TableHead>
                    <TableHead>Signed Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workshop.presentations.map((presentation) => (
                    <TableRow key={presentation.id}>
                      <TableCell className="font-medium">
                        {presentation.title}
                      </TableCell>
                      <TableCell>{presentation.name}</TableCell>
                      <TableCell>{presentation.email}</TableCell>
                      <TableCell>{presentation.department.name}</TableCell>
                      <TableCell>{presentation.minutes}</TableCell>
                      <TableCell>
                        {new Date(presentation.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );
      })}
    </div>
  );
}
