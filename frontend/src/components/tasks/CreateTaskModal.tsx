"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Plus, Globe, Lock } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "sonner";
import TeamTreeSelector from "@/components/tasks/TeamTreeSelector";

interface Props { onClose: () => void; }

export default function CreateTaskModal({ onClose }: Props) {
  const { createTask } = useTaskStore();
  const { users, teams, fetchUsers, fetchTeams } = useAdminStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [deadline, setDeadline] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("private");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchUsers(); fetchTeams(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required.");
    setLoading(true);
    try {
      await createTask({
        title,
        description,
        priority: priority as any,
        deadline: deadline || undefined,
        assignedTo: selectedUserIds as any,
        visibility,
      });
      toast.success("Task created successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create task.");
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ duration: 0.2 }}
        className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">Create New Task</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title *</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Describe the task..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Deadline</label>
              <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Visibility</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setVisibility("private")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  visibility === "private"
                    ? "bg-primary/15 border-primary/30 text-primary"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}>
                <Lock className="w-4 h-4" /> Private
              </button>
              <button type="button" onClick={() => setVisibility("public")}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  visibility === "public"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                }`}>
                <Globe className="w-4 h-4" /> Public
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {visibility === "public" ? "Visible to everyone in the organization" : "Only visible to you and assigned members"}
            </p>
          </div>

          {/* Hierarchical Assignment Selector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Assign To {selectedUserIds.length > 0 && <span className="text-primary">({selectedUserIds.length} selected)</span>}
            </label>
            <TeamTreeSelector users={users} teams={teams} selected={selectedUserIds} onChange={setSelectedUserIds} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors">Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
              {loading ? "Creating..." : <><Plus className="w-4 h-4" /> Create Task</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
