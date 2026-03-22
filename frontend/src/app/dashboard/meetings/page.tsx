"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CalendarPlus, Calendar, Clock, Link as LinkIcon, Users } from "lucide-react";
import api from "@/lib/api";
import { Meeting } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from "date-fns";
import { useSocket } from "@/providers/SocketProvider";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentDate] = useState(new Date());
  const [form, setForm] = useState({ title: "", dateTime: "", notes: "", meetingLink: "", participants: "" });
  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    api.get("/meetings").then((res) => setMeetings(res.data.data.meetings || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("NEW_MEETING", (meeting: Meeting) => {
      setMeetings((prev) => {
        if (prev.some((m) => m._id === meeting._id)) return prev;
        return [...prev, meeting].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      });
    });
    socket.on("MEETING_UPDATED", (meeting: Meeting) => {
      setMeetings((prev) => prev.map((m) => (m._id === meeting._id ? meeting : m)).sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()));
    });
    socket.on("MEETING_DELETED", (id: string) => {
      setMeetings((prev) => prev.filter((m) => m._id !== id));
    });

    return () => {
      socket.off("NEW_MEETING");
      socket.off("MEETING_UPDATED");
      socket.off("MEETING_DELETED");
    };
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/meetings", {
        ...form,
        participants: form.participants ? form.participants.split(",").map((s) => s.trim()) : [],
      });
      // Wait for socket to supply the meeting, optimistic UI can be risky globally if not standard
      // But keeping it here for fast local response
      setMeetings((prev) => {
        if (prev.some(m => m._id === res.data.data.meeting._id)) return prev;
        return [res.data.data.meeting, ...prev].sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());
      });
      setShowForm(false);
      setForm({ title: "", dateTime: "", notes: "", meetingLink: "", participants: "" });
      toast.success("Meeting scheduled!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to schedule meeting.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mini Calendar
  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const meetingDates = meetings.map((m) => parseISO(m.dateTime));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Meetings</h2>
          <p className="text-sm text-muted-foreground">{meetings.length} scheduled meetings</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <CalendarPlus className="w-4 h-4" /> Schedule Meeting
        </motion.button>
      </div>

      {/* Schedule Form */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4">New Meeting</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block">Title *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Meeting title..." className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Date & Time *</label>
              <input required type="datetime-local" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Meeting Link</label>
              <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/..." className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground mb-1.5 block">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
                placeholder="Agenda or notes..." className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60">
                {submitting ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Calendar Grid */}
      <div className="glass rounded-2xl p-6">
        <h3 className="font-semibold text-foreground mb-4">{format(currentDate, "MMMM yyyy")}</h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i} />)}
          {days.map((day) => {
            const hasMeeting = meetingDates.some((md) => isSameDay(md, day));
            const isToday = isSameDay(day, new Date());
            return (
              <div key={day.toISOString()} className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-xs font-medium relative",
                isToday ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground",
              )}>
                {format(day, "d")}
                {hasMeeting && !isToday && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Meeting List */}
      <div className="space-y-3">
        {loading
          ? [...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-secondary rounded-xl h-20" />)
          : meetings.length === 0
          ? <div className="glass rounded-2xl p-8 text-center text-muted-foreground text-sm">No meetings scheduled yet.</div>
          : meetings.map((m) => (
              <motion.div key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="glass rounded-xl p-4 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground">{m.title}</h4>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{format(parseISO(m.dateTime), "MMM d, yyyy · h:mm a")}</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{m.participants.length} participants</span>
                    </div>
                    {m.notes && <p className="text-xs text-muted-foreground mt-1.5">{m.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn("text-xs px-2 py-1 rounded font-medium", {
                    "bg-primary/10 text-primary": m.status === "scheduled",
                    "bg-emerald-500/10 text-emerald-400": m.status === "completed",
                    "bg-red-500/10 text-red-400": m.status === "cancelled",
                  })}>
                    {m.status}
                  </span>
                  {m.meetingLink && (
                    <a href={m.meetingLink} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
        }
      </div>
    </div>
  );
}
