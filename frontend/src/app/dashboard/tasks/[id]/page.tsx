"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft, Upload, Clock, CheckCircle, Send, Paperclip,
  Eye, ThumbsUp, Globe, Lock, Users,
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { ProgressUpdate, Task } from "@/lib/types";
import api from "@/lib/api";
import { cn, getPriorityColor, getStatusColor, formatDate, formatRelativeTime, getRoleColor, isAdmin } from "@/lib/utils";
import { toast } from "sonner";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: me } = useAuthStore();
  const { acknowledgeTask } = useTaskStore();
  const [task, setTask] = useState<Task | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [desc, setDesc] = useState("");
  const [increment, setIncrement] = useState(10);
  const [files, setFiles] = useState<FileList | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ackLoading, setAckLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      setLoading(true);
      api.get(`/tasks/${params.id}`)
        .then((res) => {
          setTask(res.data.data.task);
          setProgressUpdates(res.data.data.progressUpdates || []);
        })
        .catch(() => toast.error("Could not load task."))
        .finally(() => setLoading(false));
    }
  }, [params.id]);

  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim()) return toast.error("Description is required.");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("description", desc);
      formData.append("progressIncrement", String(increment));
      if (files) Array.from(files).forEach((f) => formData.append("attachments", f));

      const res = await api.post(`/tasks/${params.id}/progress`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProgressUpdates((prev) => [res.data.data.progressUpdate, ...prev]);
      setTask((prev) => prev ? {
        ...prev,
        progress: res.data.data.newProgress,
        isCompleted: res.data.data.newProgress >= 100,
        status: res.data.data.newProgress >= 100 ? "Completed" : res.data.data.newProgress > 0 ? "In Progress" : prev.status,
      } : prev);
      setDesc(""); setIncrement(10); setFiles(null);
      toast.success("Progress update added!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add update.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcknowledge = async (status: "seen" | "accepted") => {
    if (!params.id) return;
    setAckLoading(true);
    try {
      await acknowledgeTask(params.id as string, status);
      // Refresh task data to get updated acknowledgements
      const res = await api.get(`/tasks/${params.id}`);
      setTask(res.data.data.task);
      toast.success(status === "seen" ? "Marked as seen" : "Task accepted");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setAckLoading(false);
    }
  };

  // Get current user's acknowledgement status
  const myAck = task?.acknowledgements?.find(
    (a) => a.user?._id === me?._id
  );

  if (loading || !task) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-secondary rounded-xl h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tasks
      </button>

      {/* Task Header */}
      <div className="glass rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-foreground">{task.title}</h1>
              {task.visibility === "public" ? (
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-3 h-3" /> Public
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  <Lock className="w-3 h-3" /> Private
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={cn("text-xs px-2 py-1 rounded border font-medium", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
            <span className={cn("text-xs px-2 py-1 rounded border font-medium", getStatusColor(task.status))}>
              {task.status}
            </span>
          </div>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-bold text-foreground">{task.progress}%</span>
          </div>
          <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${task.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full"
            />
          </div>
          {task.isCompleted && (
            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Task completed!
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Created by</p>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {task.creator?.name[0]}
              </div>
              <span className="text-sm font-medium text-foreground">{task.creator?.name}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Assigned to</p>
            <div className="flex -space-x-1">
              {task.assignedTo?.map((u) => (
                <div key={u._id} title={u.name} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-primary text-xs font-bold">
                  {u.name[0]}
                </div>
              ))}
            </div>
          </div>
          {task.deadline && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deadline</p>
              <p className="text-sm font-medium text-foreground">{formatDate(task.deadline)}</p>
            </div>
          )}
        </div>

        {/* Attachments */}
        {task.attachments?.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {task.attachments.map((att, i) => (
                <a key={i} href={att.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-secondary rounded-lg border border-border hover:border-primary/40 transition-colors text-foreground">
                  <Paperclip className="w-3 h-3" /> {att.fileType.includes("image") ? "Image" : "File"} {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Acknowledgement — for assigned members */}
      {me && task.assignedTo?.some((u) => u._id === me._id) && !isAdmin(me.role) && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground text-sm">Task Acknowledgement</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {myAck?.status === "accepted" ? "✅ You have accepted this task" :
                  myAck?.status === "seen" ? "👁 You have seen this task — click Accept to confirm" :
                  "Let the team know you've seen this task"}
              </p>
            </div>
            <div className="flex gap-2">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                disabled={ackLoading || myAck?.status === "seen" || myAck?.status === "accepted"}
                onClick={() => handleAcknowledge("seen")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                  myAck?.status ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-secondary text-muted-foreground border-border hover:border-blue-500/40 hover:text-blue-400"
                )}>
                <Eye className="w-3.5 h-3.5" /> Seen
              </motion.button>
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                disabled={ackLoading || myAck?.status === "accepted"}
                onClick={() => handleAcknowledge("accepted")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-all",
                  myAck?.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-secondary text-muted-foreground border-border hover:border-emerald-500/40 hover:text-emerald-400"
                )}>
                <ThumbsUp className="w-3.5 h-3.5" /> Accept
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Acknowledgement Status — visible to admin */}
      {me && isAdmin(me.role) && task.acknowledgements && task.acknowledgements.length > 0 && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Acknowledgements</h3>
            <span className="text-xs text-muted-foreground">({task.acknowledgements.length} / {task.assignedTo?.length || 0})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {task.acknowledgements.map((ack, i) => (
              <div key={i} className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                  {ack.user?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground truncate block">{ack.user?.name}</span>
                </div>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded font-medium",
                  ack.status === "accepted" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                )}>
                  {ack.status === "accepted" ? "✓ Accepted" : "👁 Seen"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Progress Update */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-foreground mb-4">Add Progress Update</h2>
        <form onSubmit={handleProgressSubmit} className="space-y-4">
          <textarea
            value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
            placeholder="Describe what was completed..."
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground">Progress Increment: <span className="font-medium text-foreground text-sm">{increment}%</span></label>
              <input type="range" min={0} max={100 - task.progress} value={increment}
                onChange={(e) => setIncrement(Number(e.target.value))}
                className="w-full accent-primary mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Attachments</label>
              <label className="flex items-center gap-2 text-xs px-3 py-2 bg-secondary border border-border rounded-lg cursor-pointer hover:border-primary/40 text-muted-foreground hover:text-foreground transition-colors">
                <Upload className="w-3.5 h-3.5" />
                {files ? `${files.length} file(s)` : "Upload files"}
                <input type="file" multiple hidden onChange={(e) => setFiles(e.target.files)} />
              </label>
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
            <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Update"}
          </motion.button>
        </form>
      </div>

      {/* Progress Timeline */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-semibold text-foreground mb-5">Progress Timeline</h2>
        {progressUpdates.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No updates yet. Be the first to add progress!</p>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-6">
              {progressUpdates.map((upd, i) => (
                <motion.div
                  key={upd._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-4 pl-10 relative"
                >
                  <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  <div className="flex-1 bg-secondary border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {upd.user?.name[0]}
                        </div>
                        <span className="text-sm font-medium text-foreground">{upd.user?.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-primary">+{upd.progressIncrement}%</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatRelativeTime(upd.createdAt)}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{upd.description}</p>
                    {upd.attachments?.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {upd.attachments.map((a, j) => (
                          <a key={j} href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs px-2 py-1 bg-card rounded border border-border text-primary hover:underline">
                            {a.fileType.startsWith("image") ? "🖼 Image" : "📄 File"} {j + 1}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
