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

interface AdminDataTableProps {
  slots: Slot[];
}

export function AdminDataTable({ slots }: AdminDataTableProps) {
  if (slots.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No slots created yet. Use the form above to create one.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      {slots.map((slot) => {
        const spotsLeft = slot.maxAttendees - slot.signups.length;
        return (
          <div key={slot.id} className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <h3 className="font-semibold">{slot.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(slot.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <Badge variant={spotsLeft <= 0 ? "destructive" : "secondary"}>
                {slot.signups.length} / {slot.maxAttendees} attendees
              </Badge>
            </div>

            {slot.signups.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted-foreground">
                No signups yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Signed Up</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slot.signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell className="font-medium">{signup.name}</TableCell>
                      <TableCell>{signup.email}</TableCell>
                      <TableCell>{signup.department}</TableCell>
                      <TableCell>
                        {new Date(signup.createdAt).toLocaleDateString()}
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
