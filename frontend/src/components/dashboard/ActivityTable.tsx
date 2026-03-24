"use client";
import { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface ActivityTableProps {
  tasks: Task[];
}

const statusLabel = (status: Task["status"]) => {
  if (status === "in-progress") return "In Progress";
  if (status === "blocked") return "Blocked";
  if (status === "completed") return "Completed";
  return "Not Started";
};

export default function ActivityTable({ tasks }: ActivityTableProps) {
  return (
    <div className="premium-glass table-panel">
      <div className="panel-head">
        <h3>Activity Feed</h3>
        <p>Latest task operations and assignments</p>
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
            {tasks.slice(0, 8).map((task) => (
              <tr key={task._id}>
                <td>{task.title}</td>
                <td className="muted">
                  {task.assignmentType === "team" ? "Team" : task.assignmentType === "hybrid" ? "Team + Member" : "Individual"}
                </td>
                <td className="muted">{task.assignedTo?.name || task.team?.name || "Unassigned"}</td>
                <td className="muted">{task.dueDate ? formatDate(task.dueDate) : "No deadline"}</td>
                <td>
                  <span className={`status-chip ${task.status}`}>{statusLabel(task.status)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {tasks.length === 0 && <p className="empty-label">No task activity yet.</p>}
      </div>
    </div>
  );
}
