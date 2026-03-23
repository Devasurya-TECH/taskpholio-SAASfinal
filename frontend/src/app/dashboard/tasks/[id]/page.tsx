"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Upload, Clock, CheckCircle, Send, Paperclip,
  Globe, Lock, Users, Plus, MessageSquare, ListTodo, History,
  Trash2, MoreVertical, Cloud, Save
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { cn, getPriorityColor, getStatusColor, formatDate, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: me } = useAuthStore();
  const { fetchTask, currentTask: task, updateTaskStatus } = useTaskStore();
  
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "subtasks" | "activity">("details");

  useEffect(() => {
    if (params.id) fetchTask(params.id as string);
  }, [params.id]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/tasks/${task?._id}/comments`, { text: comment });
      setComment("");
      fetchTask(task?._id as string);
      toast.success("Comment added");
    } catch (err) {
      toast.error("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await api.patch(`/tasks/${task?._id}/subtasks/${subtaskId}`);
      fetchTask(task?._id as string);
    } catch (err) {
      toast.error("Failed to update subtask");
    }
  };

  if (!task) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground font-medium animate-pulse">Decrypting mission intelligence...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()} 
          className="group flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-all bg-secondary/30 px-4 py-2 rounded-xl border border-border/50"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        <div className="flex gap-2">
           <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border", getStatusColor(task.status))}>
            {task.status}
          </span>
          <span className={cn("text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border", getPriorityColor(task.priority))}>
            {task.priority} Priority
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 border-primary/10 shadow-xl">
            <h1 className="text-3xl font-black text-foreground tracking-tight mb-4">{task.title}</h1>
            <div className="prose prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Progress Visualization */}
            <div className="mt-8 space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Completion Progress</span>
                <span className="text-2xl font-black text-primary">{task.progress}%</span>
              </div>
              <div className="h-3 w-full bg-secondary rounded-full overflow-hidden p-0.5 border border-border">
                <motion.div 
                  initial={{ width: 0 }} 
                  animate={{ width: `${task.progress}%` }} 
                  className="h-full bg-gradient-to-r from-primary via-purple-500 to-blue-500 rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.4)]" 
                />
              </div>
            </div>
          </motion.div>

          {/* Interactive Tabs Section */}
          <div className="space-y-4">
            <div className="flex gap-1 bg-secondary/30 p-1.5 rounded-2xl w-fit border border-border/50">
              {[
                { id: "details", label: "Details", icon: MessageSquare },
                { id: "subtasks", label: `Subtasks (${task.subtasks?.length || 0})`, icon: ListTodo },
                { id: "activity", label: "History", icon: History }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                    activeTab === tab.id ? "bg-background shadow-lg text-primary scale-105" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === "subtasks" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6 space-y-4">
                  {task.subtasks?.length > 0 ? (
                    task.subtasks.map((st) => (
                      <div 
                        key={st._id} 
                        onClick={() => handleToggleSubtask(st._id)}
                        className="group flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-secondary/40 transition-all cursor-pointer"
                      >
                        <div className={cn(
                          "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                          st.completed ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20" : "border-border group-hover:border-primary/50"
                        )}>
                          {st.completed && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className={cn("text-sm font-bold flex-1 transition-all", st.completed ? "text-muted-foreground line-through opacity-50" : "text-foreground")}>
                          {st.title}
                        </span>
                        {st.assignedTo && (
                          <div className={cn("text-[10px] px-2 py-1 rounded bg-secondary/50 font-bold border border-border")}>
                            {st.assignedTo.name}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-sm text-muted-foreground">No subtasks defined. Break this mission down!</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Comments System */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-black mb-6">Internal Intelligence (Comments)</h3>
                    <div className="space-y-6 mb-8">
                      {task.comments?.map((c) => (
                        <div key={c._id} className="flex gap-4">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20 shrink-0">
                            {c.user?.name[0]}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black uppercase text-foreground">{c.user?.name}</span>
                              <span className="text-[10px] text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
                            </div>
                            <div className="bg-secondary/40 rounded-2xl rounded-tl-none p-4 border border-border/50">
                              <p className="text-sm text-foreground/90 leading-relaxed">{c.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={handleAddComment} className="relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Intercept and share your briefing..."
                        className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all pr-16"
                        rows={3}
                      />
                      <button 
                        type="submit" 
                        disabled={isSubmitting || !comment.trim()}
                        className="absolute right-4 bottom-4 p-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </motion.div>
              )}

              {activeTab === "activity" && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="glass rounded-2xl p-6">
                  <div className="relative pl-8 space-y-8">
                    <div className="absolute left-3.5 top-2 bottom-2 w-px bg-gradient-to-b from-primary via-purple-500/30 to-border" />
                    {task.activity?.map((act, i) => (
                      <div key={i} className="relative">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-primary border-4 border-background ring-4 ring-primary/10 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] uppercase font-black tracking-widest text-primary">{act.action.replace('_', ' ')}</span>
                             <span className="text-[10px] text-muted-foreground">• {formatRelativeTime(act.timestamp)}</span>
                          </div>
                          <p className="text-sm font-bold text-foreground">{act.details}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> Initiated by {act.user?.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar Intelligence */}
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass rounded-3xl p-6 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-4">Mission Assets</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center p-2.5">
                  <Globe className="w-full h-full text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Visibility</p>
                  <p className="text-sm font-bold capitalize">{task.visibility || "Standard"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center p-2.5">
                  <Users className="w-full h-full text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Operative Assigned</p>
                  <p className="text-sm font-bold">{task.assignedTo?.name || "Unassigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center p-2.5">
                  <Clock className="w-full h-full text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <p className="text-sm font-bold">{task.dueDate ? formatDate(task.dueDate) : "Undetermined"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-border/50">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Attachments</p>
              {task.attachments?.length > 0 ? (
                <div className="grid gap-2">
                  {task.attachments.map((file, i) => (
                    <a key={i} href={file.fileUrl} target="_blank" className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-border/50 hover:border-primary/50 transition-all group">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <Paperclip className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <span className="text-xs font-bold text-foreground truncate">{file.fileName}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 uppercase">{file.fileType.split('/')[1]}</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No assets attached to this mission.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
