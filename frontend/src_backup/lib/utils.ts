import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case "High": return "text-red-400 bg-red-400/10 border-red-400/20";
    case "Medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
    case "Low": return "text-green-400 bg-green-400/10 border-green-400/20";
    default: return "text-muted-foreground bg-muted";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Completed": return "text-emerald-400 bg-emerald-400/10 border-emerald-400/20";
    case "In Progress": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
    case "Not Started": return "text-muted-foreground bg-muted border-border";
    default: return "text-muted-foreground bg-muted border-border";
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case "CEO": return "text-purple-400 bg-purple-400/10";
    case "CTO": return "text-blue-400 bg-blue-400/10";
    case "Member": return "text-green-400 bg-green-400/10";
    default: return "text-muted-foreground bg-muted";
  }
}

export function isAdmin(role: string): boolean {
  return role === "CEO" || role === "CTO";
}
