export interface User {
  _id: string;
  name: string;
  email: string;
  role: "CEO" | "CTO" | "Member";
  avatar: string;
  team?: any;
  createdAt: string;
}

export interface Attachment {
  fileUrl: string;
  fileType: string;
  uploadedBy?: string | User;
}

export interface Acknowledgement {
  _id?: string;
  user: User;
  status: "seen" | "accepted";
  at: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  creator: User;
  assignedTo: User[];
  visibleTo: User[];
  visibility: "public" | "private";
  priority: "Low" | "Medium" | "High";
  status: "Not Started" | "In Progress" | "Completed";
  deadline?: string;
  attachments: Attachment[];
  acknowledgements: Acknowledgement[];
  progress: number;
  isCompleted: boolean;
  team?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressUpdate {
  _id: string;
  task: string;
  user: User;
  description: string;
  attachments: Attachment[];
  progressIncrement: number;
  createdAt: string;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string;
  createdBy: User;
  participants: User[];
  dateTime: string;
  notes: string;
  meetingLink: string;
  status: "scheduled" | "completed" | "cancelled";
  reminders: string[];
  createdAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  type: "TASK_ASSIGNED" | "PROGRESS_UPDATE" | "DEADLINE_ALERT" | "MEETING_SCHEDULED" | "MEETING_UPDATED" | "GENERAL";
  message: string;
  read: boolean;
  relatedTask?: Task;
  relatedMeeting?: Meeting;
  createdAt: string;
}

export interface Team {
  _id: string;
  name: string;
  description: string;
  manager: User;
  members: User[];
  createdAt: string;
}
