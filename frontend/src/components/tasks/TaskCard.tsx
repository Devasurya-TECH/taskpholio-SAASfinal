"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, User, MoreHorizontal, MessageSquare, Paperclip, 
  ChevronDown, ChevronUp, CheckCircle2, Clock, Play, 
  AlertCircle, ShieldCheck, Flag, Users, Tag
} from "lucide-react";
import { cn, getPriorityColor, getStatusColor, formatDate } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { toast } from "sonner";
import Image from "next/image";

interface TaskCardProps {
  task: any;
  view?: "grid" | "list";
}

export default function TaskCard({ task, view = "grid" }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { updateTaskStatus } = useTaskStore();
  const isGrid = view === "grid";

  const handleStatusChange = async (newStatus: string) => {
    try {
      await updateTaskStatus(task._id, newStatus as any);
      toast.success(`Mission Protocol: ${newStatus.toUpperCase()} initialized.`);
    } catch (error) {
      toast.error("Protocol override failed.");
    }
  };

  const priorityColors = {
    low: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    medium: "text-blue-400 bg-blue-400/10 border-blue-400/20",
    high: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    urgent: "text-red-500 bg-red-500/10 border-red-500/20"
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    in_progress: <Play className="w-4 h-4 animate-pulse" />,
    review: <ShieldCheck className="w-4 h-4" />,
    completed: <CheckCircle2 className="w-4 h-4" />,
    blocked: <AlertCircle className="w-4 h-4" />
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass border-l-4 rounded-2xl p-5 transition-all group hover:shadow-[0_0_30px_rgba(0,0,0,0.2)]",
        task.priority === "urgent" ? "border-l-red-500" : 
        task.priority === "high" ? "border-l-amber-500" : 
        task.priority === "medium" ? "border-l-blue-500" : "border-l-emerald-500"
      )}
    >
      <div className="flex flex-col gap-4">
        {/* Header: Priority and Meta */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <span className={cn(
              "text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border",
              priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
            )}>
              {task.priority} Priority
            </span>
            {task.team && (
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                {task.team.name}
              </span>
            )}
          </div>
          <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* Title and Description */}
        <div>
          <h4 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors leading-tight">
            {task.title}
          </h4>
          {task.description && (
            <p className={cn(
              "text-xs text-muted-foreground leading-relaxed",
              !expanded && "line-clamp-2"
            )}>
              {task.description}
            </p>
          )}
        </div>

        {/* Progress Tracker */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
            <span className="text-muted-foreground">Mission Progress</span>
            <span className="text-primary">{task.progress || 0}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${task.progress || 0}%` }}
              className={cn(
                "h-full transition-all duration-500",
                (task.progress || 0) >= 100 ? "bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" : "bg-blue-500"
              )}
            />
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate ? formatDate(task.dueDate) : "No Deadline"}
            </div>
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <MessageSquare className="w-3.5 h-3.5" />
                {task.comments.length}
              </div>
            )}
            {task.attachments?.length > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <Paperclip className="w-3.5 h-3.5" />
                {task.attachments.length}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {task.assignedTo && (
              <div className="relative group/user">
                <div className="w-8 h-8 rounded-full border-2 border-white/10 bg-black/40 flex items-center justify-center overflow-hidden">
                  {task.assignedTo.avatar ? (
                    <Image src={task.assignedTo.avatar} alt={task.assignedTo.name} width={32} height={32} />
                  ) : (
                    <span className="text-[10px] font-black uppercase">{task.assignedTo.name?.[0]}</span>
                  )}
                </div>
                <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black rounded text-[8px] font-black uppercase whitespace-nowrap opacity-0 group-hover/user:opacity-100 transition-opacity z-10 border border-white/10">
                  {task.assignedTo.name}
                </div>
              </div>
            )}
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-muted-foreground transition-all"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/5 pt-4 space-y-6"
            >
              {/* Sub-objectives */}
              {task.subtasks?.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Sub-Objectives
                  </h5>
                  <div className="space-y-2">
                    {task.subtasks.map((st: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 p-2.5 rounded-xl border border-white/5">
                        <div className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center transition-all",
                          st.completed ? "bg-primary border-primary text-black" : "border-white/20"
                        )}>
                          {st.completed && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className={cn(
                          "text-xs font-medium",
                          st.completed ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {st.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tactical Tags */}
              {task.tags?.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5" />
                    Tactical Tags
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {task.tags.map((tag: string) => (
                      <span key={tag} className="px-2.5 py-1 bg-white/5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-muted-foreground border border-white/5">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Protocol Control */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  Protocol Protocol
                </h5>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'in_progress', label: 'Initialize', icon: <Play className="w-3 h-3" /> },
                    { id: 'review', label: 'Review', icon: <ShieldCheck className="w-3 h-3" /> },
                    { id: 'completed', label: 'Complete', icon: <CheckCircle2 className="w-3 h-3" /> }
                  ].map((protocol) => (
                    <button
                      key={protocol.id}
                      onClick={() => handleStatusChange(protocol.id)}
                      disabled={task.status === protocol.id}
                      className={cn(
                        "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all uppercase tracking-tighter font-black text-[9px]",
                        task.status === protocol.id 
                          ? "bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(34,197,94,0.2)]" 
                          : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      {protocol.icon}
                      {protocol.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Comms Link */}
              <button className="w-full py-3 bg-secondary/50 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-secondary transition-all border border-white/5 text-muted-foreground">
                View Full Intelligence Report
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
