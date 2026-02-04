"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";

interface FeedbackStatus {
  id: string;
  name: string;
  isClosed: boolean;
}

interface Feedback {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  status: FeedbackStatus;
  presentation: {
    id: string;
    title: string;
    department: { id: string; name: string };
    workshop: { id: string; date: string };
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [statuses, setStatuses] = useState<FeedbackStatus[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showClosed, setShowClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async (page: number, includeClosed: boolean) => {
    setLoading(true);
    const res = await fetch(
      `/api/feedback?page=${page}&limit=10&showClosed=${includeClosed}`
    );
    const data = await res.json();
    setFeedbacks(data.feedbacks);
    setPagination(data.pagination);
    setLoading(false);
  }, []);

  const fetchStatuses = useCallback(async () => {
    const res = await fetch("/api/feedback-statuses");
    const data = await res.json();
    setStatuses(data);
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  useEffect(() => {
    fetchFeedbacks(pagination.page, showClosed);
  }, [fetchFeedbacks, pagination.page, showClosed]);

  async function handleStatusChange(feedbackId: string, statusId: string) {
    await fetch(`/api/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId }),
    });
    fetchFeedbacks(pagination.page, showClosed);
  }

  function handleToggleClosed() {
    setShowClosed(!showClosed);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handlePrevPage() {
    if (pagination.page > 1) {
      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
    }
  }

  function handleNextPage() {
    if (pagination.page < pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Feedback</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Review and manage presentation feedback.
          </p>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <Button
            variant={showClosed ? "default" : "outline"}
            onClick={handleToggleClosed}
          >
            {showClosed ? "Showing All" : "Showing Open Only"}
          </Button>
          <div className="text-sm text-muted-foreground">
            {pagination.total} feedback item{pagination.total !== 1 ? "s" : ""}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading feedback...
          </p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-muted-foreground">
            No feedback found.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Presentation</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {f.presentation.title}
                    </TableCell>
                    <TableCell>{f.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {f.presentation.department.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(f.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-muted-foreground">
                      {f.text.slice(0, 40)}
                      {f.text.length > 40 ? "..." : ""}
                    </TableCell>
                    <TableCell>
                      <StatusChangeBadge
                        feedback={f}
                        statuses={statuses}
                        onStatusChange={handleStatusChange}
                      />
                    </TableCell>
                    <TableCell>
                      <FeedbackDetailDialog feedback={f} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft size={16} />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.totalPages}
                >
                  <ChevronRight size={16} />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function FeedbackDetailDialog({ feedback }: { feedback: Feedback }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Eye size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{feedback.presentation.title}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Feedback from {feedback.name} &middot;{" "}
            {new Date(feedback.createdAt).toLocaleDateString()}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Department</p>
            <p className="text-sm text-muted-foreground">
              {feedback.presentation.department.name}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Status</p>
            <Badge
              variant={feedback.status.isClosed ? "secondary" : "default"}
            >
              {feedback.status.name}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Feedback</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {feedback.text}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StatusChangeBadge({
  feedback,
  statuses,
  onStatusChange,
}: {
  feedback: Feedback;
  statuses: FeedbackStatus[];
  onStatusChange: (feedbackId: string, statusId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  function handleChange(statusId: string) {
    onStatusChange(feedback.id, statusId);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="cursor-pointer">
          <Badge
            variant={feedback.status.isClosed ? "secondary" : "default"}
            className="hover:opacity-80"
          >
            {feedback.status.name}
          </Badge>
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Status</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Update the status for feedback from {feedback.name}
          </p>
        </DialogHeader>
        <Select
          defaultValue={feedback.status.id}
          onValueChange={handleChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.id} value={status.id}>
                {status.name}
                {status.isClosed && " (Closed)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </DialogContent>
    </Dialog>
  );
}
