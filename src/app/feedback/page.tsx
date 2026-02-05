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
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Department {
  id: string;
  name: string;
}

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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [showClosed, setShowClosed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFeedbacks = useCallback(async (page: number, includeClosed: boolean, departmentId: string) => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
      showClosed: String(includeClosed),
    });
    if (departmentId) {
      params.set("departmentId", departmentId);
    }
    const res = await fetch(`/api/feedback?${params.toString()}`);
    const data = await res.json();
    setFeedbacks(data.feedbacks);
    setPagination(data.pagination);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/feedback-statuses").then((res) => res.json()),
      fetch("/api/departments").then((res) => res.json()),
    ]).then(([statusData, deptData]) => {
      if (!cancelled) {
        setStatuses(statusData);
        setDepartments(deptData);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!cancelled) setLoading(true);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: "10",
        showClosed: String(showClosed),
      });
      if (selectedDepartment) {
        params.set("departmentId", selectedDepartment);
      }
      const res = await fetch(`/api/feedback?${params.toString()}`);
      const data = await res.json();
      if (!cancelled) {
        setFeedbacks(data.feedbacks);
        setPagination(data.pagination);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pagination.page, showClosed, selectedDepartment]);

  async function handleStatusChange(feedbackId: string, statusId: string) {
    await fetch(`/api/feedback/${feedbackId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statusId }),
    });
    fetchFeedbacks(pagination.page, showClosed, selectedDepartment);
  }

  function handleToggleClosed() {
    setShowClosed(!showClosed);
    setPagination((prev) => ({ ...prev, page: 1 }));
  }

  function handleDepartmentChange(value: string) {
    setSelectedDepartment(value === "all" ? "" : value);
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
          <div className="flex items-center gap-3">
            <Button
              variant={showClosed ? "default" : "outline"}
              onClick={handleToggleClosed}
            >
              {showClosed ? "Showing All" : "Showing Open Only"}
            </Button>
            <Select
              value={selectedDepartment || "all"}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Presentation</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbacks.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <FeedbackEditDialog
                        feedback={f}
                        statuses={statuses}
                        onSave={() => fetchFeedbacks(pagination.page, showClosed, selectedDepartment)}
                      />
                    </TableCell>
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
                    <TableCell className="max-w-[200px] overflow-hidden">
                      <FeedbackPreviewLink feedback={f} />
                    </TableCell>
                    <TableCell>
                      <StatusChangeBadge
                        feedback={f}
                        statuses={statuses}
                        onStatusChange={handleStatusChange}
                      />
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

function FeedbackPreviewLink({ feedback }: { feedback: Feedback }) {
  const preview = feedback.text.slice(0, 40) + (feedback.text.length > 40 ? "..." : "");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="block w-full truncate text-left text-primary underline underline-offset-2 hover:text-primary/80 cursor-pointer"
        >
          {preview}
        </button>
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

function FeedbackEditDialog({
  feedback,
  statuses,
  onSave,
}: {
  feedback: Feedback;
  statuses: FeedbackStatus[];
  onSave: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(feedback.name);
  const [text, setText] = useState(feedback.text);
  const [statusId, setStatusId] = useState(feedback.status.id);
  const [saving, setSaving] = useState(false);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setName(feedback.name);
      setText(feedback.text);
      setStatusId(feedback.status.id);
    }
  }

  async function handleSave() {
    setSaving(true);
    await fetch(`/api/feedback/${feedback.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text, statusId }),
    });
    setSaving(false);
    setOpen(false);
    onSave();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil size={14} />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Feedback</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {feedback.presentation.title}
          </p>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">From</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-text">Feedback</Label>
            <Textarea
              id="edit-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={statusId} onValueChange={setStatusId}>
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
          </div>
          <Button
            onClick={handleSave}
            disabled={saving || !name.trim() || !text.trim()}
            className="w-full"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
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
