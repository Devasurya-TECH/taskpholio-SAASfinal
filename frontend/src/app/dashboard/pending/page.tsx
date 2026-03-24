"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock3, Pin, PinOff, Search, User, Users } from "lucide-react";
import { Task } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import "./pending.css";

const PENDING_PIN_STORAGE_KEY = "taskpholio_pending_pins";

const parseDueDateLocal = (value?: string): Date | null => {
  if (!value) return null;
  const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const month = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    return new Date(year, month, day, 0, 0, 0, 0);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
};

const isIncompleteTask = (task: Task) => task.status !== "completed" && task.status !== "cancelled";

const isTaskOverdue = (task: Task, todayStart: Date) => {
  if (!isIncompleteTask(task)) return false;
  const dueDate = parseDueDateLocal(task.dueDate);
  if (!dueDate) return false;
  return dueDate.getTime() < todayStart.getTime();
};

const isTaskDueToday = (task: Task, todayStart: Date, todayEnd: Date) => {
  if (!isIncompleteTask(task)) return false;
  const dueDate = parseDueDateLocal(task.dueDate);
  if (!dueDate) return false;
  return dueDate.getTime() >= todayStart.getTime() && dueDate.getTime() <= todayEnd.getTime();
};

const statusLabel = (status: Task["status"]) => {
  if (status === "in-progress") return "In Progress";
  if (status === "blocked") return "Blocked";
  return "Not Started";
};

export default function PendingTasksPage() {
  const { tasks, fetchTasks } = useTaskStore();
  const [search, setSearch] = useState("");
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks(true);
  }, [fetchTasks]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(PENDING_PIN_STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setPinnedIds(parsed.filter((value) => typeof value === "string"));
      }
    } catch {
      localStorage.removeItem(PENDING_PIN_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(PENDING_PIN_STORAGE_KEY, JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  const pendingTasks = useMemo(() => tasks.filter((task) => isIncompleteTask(task)), [tasks]);

  const todayStart = useMemo(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  }, []);

  const todayEnd = useMemo(() => {
    const value = new Date();
    value.setHours(23, 59, 59, 999);
    return value;
  }, []);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const visibleTasks = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    return pendingTasks
      .filter((task) => {
        if (!normalizedQuery) return true;
        const owner = task.assignedTo?.name || task.assignedTo?.email || task.team?.name || "";
        const type = task.assignmentType || "";
        return (
          task.title.toLowerCase().includes(normalizedQuery) ||
          task.description.toLowerCase().includes(normalizedQuery) ||
          owner.toLowerCase().includes(normalizedQuery) ||
          type.toLowerCase().includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        const aPinned = pinnedSet.has(a._id);
        const bPinned = pinnedSet.has(b._id);
        if (aPinned !== bPinned) return aPinned ? -1 : 1;

        const aOverdue = isTaskOverdue(a, todayStart);
        const bOverdue = isTaskOverdue(b, todayStart);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

        const aToday = isTaskDueToday(a, todayStart, todayEnd);
        const bToday = isTaskDueToday(b, todayStart, todayEnd);
        if (aToday !== bToday) return aToday ? -1 : 1;

        const aDue = parseDueDateLocal(a.dueDate)?.getTime() || Number.POSITIVE_INFINITY;
        const bDue = parseDueDateLocal(b.dueDate)?.getTime() || Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;

        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });
  }, [pendingTasks, pinnedSet, search, todayEnd, todayStart]);

  const overdueCount = useMemo(
    () => pendingTasks.filter((task) => isTaskOverdue(task, todayStart)).length,
    [pendingTasks, todayStart]
  );

  const dueTodayCount = useMemo(
    () => pendingTasks.filter((task) => isTaskDueToday(task, todayStart, todayEnd)).length,
    [pendingTasks, todayEnd, todayStart]
  );

  const togglePin = (taskId: string) => {
    setPinnedIds((previous) =>
      previous.includes(taskId) ? previous.filter((id) => id !== taskId) : [taskId, ...previous]
    );
  };

  return (
    <div className="pending-shell">
      <div className="pending-header">
        <div>
          <p className="pending-eyebrow">Execution Risk Desk</p>
          <h1>Pending Tasks</h1>
          <p>Track unfinished work, spotlight overdue deadlines, and follow owner accountability.</p>
        </div>
      </div>

      <div className="pending-stats-grid">
        <div className="pending-stat-card">
          <span>Open Tasks</span>
          <strong>{pendingTasks.length}</strong>
        </div>
        <div className="pending-stat-card warning">
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </div>
        <div className="pending-stat-card neutral">
          <span>Due Today</span>
          <strong>{dueTodayCount}</strong>
        </div>
      </div>

      <div className="pending-search-wrap">
        <Search size={16} />
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search task, owner, type..."
        />
      </div>

      <div className="pending-table-wrap">
        <table className="pending-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Deadline</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => {
              const overdue = isTaskOverdue(task, todayStart);
              const dueToday = isTaskDueToday(task, todayStart, todayEnd);
              const pinned = pinnedSet.has(task._id);

              return (
                <tr
                  key={task._id}
                  className={cn(
                    overdue ? "pending-row-overdue" : "",
                    dueToday ? "pending-row-today" : ""
                  )}
                >
                  <td>
                    <p className="pending-task-title">{task.title}</p>
                    {task.description && <p className="pending-task-desc">{task.description}</p>}
                  </td>
                  <td>
                    <div className="pending-owner">
                      {task.assignmentType === "team" ? <Users size={13} /> : <User size={13} />}
                      <span>{task.assignedTo?.name || task.team?.name || "Unassigned"}</span>
                    </div>
                  </td>
                  <td className="pending-muted">
                    {task.assignmentType === "team"
                      ? "Team"
                      : task.assignmentType === "hybrid"
                        ? "Team + Member"
                        : "Individual"}
                  </td>
                  <td className="pending-muted">
                    {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
                    {overdue && (
                      <span className="pending-deadline-chip overdue">
                        <AlertTriangle size={11} /> Overdue
                      </span>
                    )}
                    {!overdue && dueToday && (
                      <span className="pending-deadline-chip today">
                        <Clock3 size={11} /> Due Today
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-chip ${task.status}`}>{statusLabel(task.status)}</span>
                  </td>
                  <td>
                    <div className="pending-actions">
                      <button
                        type="button"
                        onClick={() => togglePin(task._id)}
                        className={cn("pending-pin-btn", pinned ? "pinned" : "")}
                      >
                        {pinned ? <PinOff size={13} /> : <Pin size={13} />}
                        {pinned ? "Unpin" : "Pin"}
                      </button>
                      <Link href={`/dashboard/tasks/${task._id}`} className="pending-open-link">
                        Open
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visibleTasks.length === 0 && (
          <p className="pending-empty">No pending tasks found for this filter.</p>
        )}
      </div>
    </div>
  );
}

