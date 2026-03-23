export interface User {
  _id: string;
  name: string;
  email: string;
  role: "CEO" | "CTO" | "Member";
  avatar?: string;
  team?: any;
  status: "active" | "away" | "busy";
  lastActive: string;
}

export interface Attachment {
  fileName: string;
  fileUrl: string;
  fileType: string;
  uploadedAt: string;
}

export interface Subtask {
  _id: string;
  title: string;
  completed: boolean;
  assignedTo?: User;
}

export interface Comment {
  _id: string;
  user: User;
  text: string;
  attachments: Attachment[];
  createdAt: string;
}

export interface Activity {
  user: User;
  action: string;
  details: string;
  timestamp: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: User;
  team: any;
  createdBy: User;
  dueDate?: string;
  attachments: Attachment[];
  subtasks: Subtask[];
  comments: Comment[];
  activity: Activity[];
  tags: string[];
  isArchived: boolean;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  organizer: User;
  attendees: User[];
  startTime: string;
  endTime: string;
  location: string;
  meetingLink?: string;
  status: "scheduled" | "ongoing" | "completed" | "cancelled";
  team: any;
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "TASK_ASSIGNED" | "COMMENT_ADDED" | "SUBTASK_UPDATED" | "MEETING_READY" | "SYSTEM";
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  lead: User;
  members: User[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    activeProjects: number;
  };
  createdAt: string;
}
export interface ProgressUpdate {
  task: string;
  newProgress: number;
}
