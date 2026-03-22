"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Search, Filter } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { Task } from "@/lib/types";
import { cn, getPriorityColor, getStatusColor, formatDate } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

const COLUMNS: { id: Task["status"]; label: string; color: string }[] = [
  { id: "Not Started", label: "Not Started", color: "border-muted-foreground/30" },
  { id: "In Progress", label: "In Progress", color: "border-blue-500/40" },
  { id: "Completed", label: "Completed", color: "border-primary/40" },
];

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/dashboard/tasks/${task._id}`}>
        <motion.div
          whileHover={{ y: -2, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          className="glass rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <h4 className="text-sm font-semibold text-foreground line-clamp-2">{task.title}</h4>
            <span className={cn("text-[10px] px-1.5 py-0.5 rounded border font-medium shrink-0", getPriorityColor(task.priority))}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
          )}

          {/* Progress bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium text-foreground">{task.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${task.progress}%` }}
                className="h-full bg-primary rounded-full"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {task.assignedTo?.slice(0, 3).map((u) => (
                <div key={u._id} title={u.name} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-primary text-[10px] font-bold">
                  {u.name[0]}
                </div>
              ))}
            </div>
            {task.deadline && (
              <span className="text-[10px] text-muted-foreground">{formatDate(task.deadline)}</span>
            )}
          </div>
        </motion.div>
      </Link>
    </div>
  );
}

function Column({ id, label, color, tasks }: { id: Task["status"]; label: string; color: string; tasks: Task[] }) {
  return (
    <div className={cn("flex-1 min-w-72 glass rounded-xl border-t-2 p-4 flex flex-col gap-3", color)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">{label}</h3>
          <span className="w-5 h-5 rounded-full bg-secondary text-muted-foreground text-xs flex items-center justify-center font-medium">
            {tasks.length}
          </span>
        </div>
      </div>
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 flex-1">
          {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
          {tasks.length === 0 && (
            <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default function TasksPage() {
  const { tasks, fetchTasks, updateTaskStatus, isLoading } = useTaskStore();
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => { fetchTasks(); }, []);

  const filtered = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchPriority = !priorityFilter || t.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const byStatus = (status: Task["status"]) => filtered.filter((t) => t.status === status);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const task = tasks.find((t) => t._id === active.id);
    const targetColumn = COLUMNS.find((col) => col.id === over.id);
    if (task && targetColumn && task.status !== targetColumn.id) {
      try {
        await updateTaskStatus(task._id, targetColumn.id);
        toast.success(`Task moved to ${targetColumn.label}`);
      } catch {
        toast.error("Failed to update task status.");
      }
    }
  };

  const activeTask = tasks.find((t) => t._id === activeId);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Tasks</h2>
          <p className="text-sm text-muted-foreground">{tasks.length} tasks total</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Task
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">All Priorities</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-5 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <Column key={col.id} {...col} tasks={byStatus(col.id)} />
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="opacity-90 rotate-1">
              <TaskCard task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Create Task Modal */}
      <AnimatePresence>
        {showModal && <CreateTaskModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
}
