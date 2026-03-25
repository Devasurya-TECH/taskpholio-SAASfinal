"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, User as UserIcon, Flag, Briefcase, Paperclip, CheckCircle2, Trash2, Loader2, Upload } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useAdminStore } from "@/store/adminStore";
import { toast } from "sonner";
import { uploadAttachments } from "@/lib/uploadAttachments";
import "./CreateTaskModal.css";

interface Props { onClose: () => void; }

interface Subtask {
  title: string;
  completed: boolean;
}

export default function CreateTaskModal({ onClose }: Props) {
  const { createTask } = useTaskStore();
  const { users, teams, fetchUsers, fetchTeams } = useAdminStore();
  const [assignmentMode, setAssignmentMode] = useState<"member" | "team">("member");
  const [memberVisibility, setMemberVisibility] = useState<"private" | "public">("private");
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    assignedTo: "",
    team: "",
    estimatedHours: 0,
    tags: [] as string[],
    subtasks: [] as Subtask[],
  });

  const [currentTag, setCurrentTag] = useState("");
  const [currentSubtask, setCurrentSubtask] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedAssignee = users.find((u) => u._id === formData.assignedTo);
  const assigneeStatusRaw = String((selectedAssignee as any)?.status || "active").toLowerCase();
  const assigneeStatus =
    assigneeStatusRaw === "away" || assigneeStatusRaw === "inactive" || assigneeStatusRaw === "busy"
      ? assigneeStatusRaw
      : "active";

  useEffect(() => {
    fetchUsers();
    fetchTeams();
  }, [fetchUsers, fetchTeams]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      assignedTo: assignmentMode === "member" ? prev.assignedTo : "",
      team: assignmentMode === "team" ? prev.team : "",
    }));
  }, [assignmentMode]);

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, currentTag.trim()] });
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const handleAddSubtask = () => {
    if (currentSubtask.trim()) {
      setFormData({ 
        ...formData, 
        subtasks: [...formData.subtasks, { title: currentSubtask.trim(), completed: false }] 
      });
      setCurrentSubtask("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setFormData({ 
      ...formData, 
      subtasks: formData.subtasks.filter((_, i) => i !== index) 
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const result = await uploadAttachments(files);
      if (result.uploaded.length > 0) {
        setAttachments((prev) => [...prev, ...result.uploaded]);
      }

      if (result.uploaded.length > 0 && result.failed.length === 0) {
        toast.success("Attachments uploaded successfully.");
      } else if (result.uploaded.length > 0 && result.failed.length > 0) {
        toast.warning(`${result.uploaded.length} file(s) uploaded, ${result.failed.length} failed.`);
      } else {
        toast.error(result.failed[0]?.reason || "Failed to upload attachments.");
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return toast.error("Task title is required.");
    if (assignmentMode === "member" && !formData.assignedTo) return toast.error("Please assign to a member.");
    if (assignmentMode === "team" && !formData.team) return toast.error("Please assign a team.");
    
    setLoading(true);
    try {
      await createTask({
        ...formData,
        assignedTo: assignmentMode === "member" ? formData.assignedTo : "",
        team: assignmentMode === "team" ? formData.team : "",
        memberVisibility,
        attachments
      });
      toast.success("Task created successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="modal-overlay"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X size={24} />
          </button>

          <div className="modal-header">
            <h2 className="modal-title">Create Task</h2>
            <p className="modal-subtitle">Add a new task to your project space.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              {/* Left Column: Core Task Info */}
              <div>
                <div className="form-group">
                  <label className="form-label">Task Title</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                    placeholder="E.g., Design new landing page"
                    className="form-input" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                    placeholder="Provide details about this task..."
                    className="form-input form-textarea" 
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Mode</label>
                  <div className="selection-grid">
                    <button
                      type="button"
                      onClick={() => setAssignmentMode("member")}
                      className={`selection-card ${assignmentMode === "member" ? "active" : ""}`}
                    >
                      <span className="selection-title">Individual Task</span>
                      <span className="selection-description">Assign to one team member</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentMode("team")}
                      className={`selection-card ${assignmentMode === "team" ? "active" : ""}`}
                    >
                      <span className="selection-title">Team-wide Task</span>
                      <span className="selection-description">Assign to an entire squad</span>
                    </button>
                  </div>
                </div>

                {assignmentMode === "member" && (
                  <div className="form-group">
                    <label className="form-label">Member Task Visibility</label>
                    <div className="selection-grid">
                      <button
                        type="button"
                        onClick={() => setMemberVisibility("private")}
                        className={`selection-card ${memberVisibility === "private" ? "active" : ""}`}
                      >
                        <span className="selection-title">Private</span>
                        <span className="selection-description">Only assignee and creator can view</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMemberVisibility("public")}
                        className={`selection-card ${memberVisibility === "public" ? "active" : ""}`}
                      >
                        <span className="selection-title">Public</span>
                        <span className="selection-description">All members can view this task</span>
                      </button>
                    </div>
                  </div>
                )}

                {assignmentMode === "member" ? (
                  <div className="form-group">
                    <label className="form-label">Assignee *</label>
                    <div className="form-input-container">
                      <UserIcon className="form-input-icon" size={16} />
                      <select
                        required
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="form-input with-icon"
                      >
                        <option value="">Select Assignee</option>
                        {users.map((u) => (
                          <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                        ))}
                      </select>
                    </div>
                    {selectedAssignee && (
                      <div className="assignee-meta">
                        <div className={`assignee-status ${assigneeStatus}`}>
                          <span className={`status-dot ${assigneeStatus}`} />
                          <span className="status-text">
                            {assigneeStatus === "inactive"
                              ? "Offline"
                              : assigneeStatus.charAt(0).toUpperCase() + assigneeStatus.slice(1)}
                          </span>
                        </div>
                        <span className="assignee-team">
                          Team:{" "}
                          {typeof (selectedAssignee as any)?.team === "object"
                            ? (selectedAssignee as any)?.team?.name || "Unassigned"
                            : (selectedAssignee as any)?.team || "Unassigned"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Team *</label>
                    <div className="form-input-container">
                      <Briefcase className="form-input-icon" size={16} />
                      <select
                        required
                        value={formData.team}
                        onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                        className="form-input with-icon"
                      >
                        <option value="">Select Team</option>
                        {teams.map((t) => (
                          <option key={t._id} value={t._id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-muted-foreground" style={{ marginTop: "0.5rem" }}>
                      Every member in this team will receive a notification instantly.
                    </p>
                  </div>
                )}

                <div className="d-flex gap-4">
                  <div className="form-group flex-1">
                    <label className="form-label">Priority</label>
                    <div className="form-input-container">
                      <Flag className="form-input-icon" size={16} />
                      <select 
                        value={formData.priority} 
                        onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                        className="form-input with-icon"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Due Date</label>
                    <div className="form-input-container">
                      <Calendar className="form-input-icon" size={16} />
                      <input 
                        type="date" 
                        value={formData.dueDate} 
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="form-input with-icon date-input" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Additional Details */}
              <div>
                <div className="form-group">
                  <label className="form-label">Subtasks</label>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      value={currentSubtask}
                      onChange={(e) => setCurrentSubtask(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                      placeholder="Add subtask..."
                      className="form-input flex-1"
                    />
                    <button 
                      type="button"
                      onClick={handleAddSubtask}
                      className="btn-icon"
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="list-container">
                    {formData.subtasks.map((st, idx) => (
                      <div key={idx} className="list-item">
                        <div className="d-flex align-center gap-2">
                          <CheckCircle2 size={16} className="text-muted" />
                          <span>{st.title}</span>
                        </div>
                        <button type="button" onClick={() => handleRemoveSubtask(idx)} className="list-item-action">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Tags</label>
                  <div className="tags-container">
                    {formData.tags.map(tag => (
                      <span key={tag} className="tag-badge">
                        {tag}
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="d-flex gap-2">
                    <input 
                      type="text" 
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add tag (e.g., frontend)..."
                      className="form-input flex-1"
                    />
                    <button 
                      type="button"
                      onClick={handleAddTag}
                      className="btn-icon"
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Attachments</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="upload-zone"
                  >
                    <input 
                      type="file" 
                      multiple 
                      hidden 
                      ref={fileInputRef} 
                      onChange={handleFileUpload}
                    />
                    <Upload size={24} className="upload-icon mx-auto" />
                    <p className="upload-text">Click to upload files</p>
                    <p className="upload-subtext">Images, PDFs, Documents (Max 10MB)</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className="attachments-grid">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="attachment-item">
                          <Paperclip size={14} className="text-secondary" />
                          <span>{file.fileName || "Attachment"}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {uploading && (
                    <div className="d-flex align-center gap-2" style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div>
                <label className="form-label" style={{ marginBottom: '0.25rem' }}>Estimated Hours</label>
                <input 
                  type="number" 
                  value={formData.estimatedHours || ''} 
                  onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                  className="effort-input"
                  placeholder="0"
                />
              </div>

              <div className="d-flex gap-4">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading || uploading}
                  className="btn-primary d-flex align-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Create Task</>}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
