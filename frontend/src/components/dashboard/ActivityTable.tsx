"use client";
import { useMemo } from "react";
import { Task } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

interface ActivityTableProps {
  tasks: Task[];
}

const statusLabel = (status: Task["status"]) => {
  if (status === "in-progress") return "In Progress";
  if (status === "blocked") return "Blocked";
  if (status === "completed") return "Completed";
  return "Not Started";
};

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

const isIncomplete = (task: Task) => task.status !== "completed" && task.status !== "cancelled";

const isOverdueTask = (task: Task, todayStart: Date) => {
  if (!isIncomplete(task)) return false;
  const due = parseDueDateLocal(task.dueDate);
  if (!due) return false;
  return due.getTime() < todayStart.getTime();
};

const isDueTodayTask = (task: Task, todayStart: Date, todayEnd: Date) => {
  if (!isIncomplete(task)) return false;
  const due = parseDueDateLocal(task.dueDate);
  if (!due) return false;
  const time = due.getTime();
  return time >= todayStart.getTime() && time <= todayEnd.getTime();
};

export default function ActivityTable({ tasks }: ActivityTableProps) {
  const visibleTasks = useMemo(() => {
    const now = Date.now();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setHours(23, 59, 59, 999);
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;

    return tasks
      .filter((task) => {
        if (task.status !== "completed") return true;
        const completedAt = new Date(task.completedAt || task.updatedAt || task.createdAt).getTime();
        if (Number.isNaN(completedAt)) return false;
        return now - completedAt <= oneWeekMs;
      })
      .sort((a, b) => {
        const aOverdue = isOverdueTask(a, todayStart);
        const bOverdue = isOverdueTask(b, todayStart);
        if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

        const aToday = isDueTodayTask(a, todayStart, todayEnd);
        const bToday = isDueTodayTask(b, todayStart, todayEnd);
        if (aToday !== bToday) return aToday ? -1 : 1;

        const aDue = parseDueDateLocal(a.dueDate)?.getTime() || Number.POSITIVE_INFINITY;
        const bDue = parseDueDateLocal(b.dueDate)?.getTime() || Number.POSITIVE_INFINITY;

        const aIncomplete = isIncomplete(a);
        const bIncomplete = isIncomplete(b);
        if (aIncomplete !== bIncomplete) return aIncomplete ? -1 : 1;

        if (aIncomplete && bIncomplete && aDue !== bDue) {
          return aDue - bDue;
        }

        const aUpdated = new Date(a.updatedAt || a.createdAt).getTime();
        const bUpdated = new Date(b.updatedAt || b.createdAt).getTime();
        return bUpdated - aUpdated;
      })
      .slice(0, 8);
  }, [tasks]);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setHours(23, 59, 59, 999);

  return (
    <div className="premium-glass table-panel">
      <div className="panel-head">
        <h3>Activity Feed</h3>
        <p>Overdue and due-today tasks are prioritized automatically</p>
      </div>
      <div className="table-wrap">
        <table className="activity-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Type</th>
              <th>Owner</th>
              <th>Deadline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleTasks.map((task) => {
              const overdue = isOverdueTask(task, todayStart);
              const dueToday = isDueTodayTask(task, todayStart, todayEnd);
              return (
              <tr key={task._id} className={cn(overdue ? "activity-row-overdue" : "", dueToday ? "activity-row-today" : "")}>
                <td>{task.title}</td>
                <td className="muted">
                  {task.assignmentType === "team" ? "Team" : task.assignmentType === "hybrid" ? "Team + Member" : "Individual"}
                </td>
                <td className="muted">{task.assignedTo?.name || task.team?.name || "Unassigned"}</td>
                <td className="muted">
                  {task.dueDate ? formatDate(task.dueDate) : "No deadline"}
                  {overdue && <span className="deadline-chip overdue"> Overdue</span>}
                  {!overdue && dueToday && <span className="deadline-chip today"> Due today</span>}
                </td>
                <td>
                  <span className={`status-chip ${task.status}`}>{statusLabel(task.status)}</span>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
        {visibleTasks.length === 0 && <p className="empty-label">No task activity yet.</p>}
      </div>
    </div>
  );
}
