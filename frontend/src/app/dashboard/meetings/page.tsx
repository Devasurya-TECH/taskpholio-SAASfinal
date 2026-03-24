"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus, Calendar, Clock, Link as LinkIcon, Users, MapPin, Video, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/api";
import { Meeting } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths } from "date-fns";
import { useSocket } from "@/providers/SocketProvider";
import { supabase } from "@/lib/supabase";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [form, setForm] = useState({ title: "", description: "", startTime: "", endTime: "", location: "", meetingLink: "", attendees: "" });
  const [submitting, setSubmitting] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const { data, error } = await supabase.from('meetings').select('*').order('scheduled_at', { ascending: true });
      if (error) throw error;
      
      const mapped = (data || []).map(m => ({
        _id: m.id,
        title: m.title,
        description: m.description,
        startTime: m.scheduled_at,
        endTime: new Date(new Date(m.scheduled_at).getTime() + 60*60*1000).toISOString(),
        location: "Virtual HQ",
        meetingLink: m.link,
        status: new Date(m.scheduled_at) > new Date() ? 'scheduled' : 'completed',
        attendees: []
      }));
      setMeetings(mapped as any);
    } catch (err) {
      toast.error("Failed to sync meeting schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!socket) return;
    socket.on("NEW_MEETING", (meeting: Meeting) => {
      setMeetings((prev) => {
        if (prev.some((m) => m._id === meeting._id)) return prev;
        return [...prev, meeting].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      });
    });
    return () => { socket.off("NEW_MEETING"); };
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.from('meetings').insert({
         title: form.title,
         description: form.description || "",
         scheduled_at: form.startTime,
         link: form.meetingLink
      }).select().single();

      if (error) throw error;

      const newMtg = {
        _id: data.id,
        title: data.title,
        description: data.description,
        startTime: data.scheduled_at,
        endTime: form.endTime || new Date(new Date(data.scheduled_at).getTime() + 60*60*1000).toISOString(),
        location: form.location || "Virtual HQ",
        meetingLink: data.link,
        status: 'scheduled',
        attendees: []
      };

      setMeetings((prev) => [newMtg, ...prev].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) as any);
      setShowForm(false);
      setForm({ title: "", description: "", startTime: "", endTime: "", location: "", meetingLink: "", attendees: "" });
      toast.success("Meeting Scheduled in Secure Channel");
    } catch (err: any) {
      toast.error(err.message || "Scheduling failure");
    } finally {
      setSubmitting(false);
    }
  };

  const days = eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
  const meetingDates = meetings.map((m) => parseISO(m.startTime));

  return (
    <div className="max-w-7xl mx-auto px-2 md:px-4 xl:px-6 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Mission Briefings</h1>
          <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mt-1">Strategic Coordination & Schedules</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }} 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-black text-xs shadow-xl shadow-primary/20 tracking-widest"
        >
          <CalendarPlus className="w-4 h-4" /> INITIATE BRIEFING
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass rounded-[2rem] p-8 space-y-6">
                <h3 className="text-xl font-black text-foreground">Briefing Protocol</h3>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mission Title</label>
                    <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                      placeholder="e.g., Q4 Strategic Overhaul..." className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Commencement</label>
                    <input required type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Conclusion</label>
                    <input required type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Intelligence Channel (Link or Location)</label>
                    <input value={form.meetingLink} onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                      placeholder="Secure Link or Physical Sector..." className="w-full bg-secondary/50 border border-border rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-4 pt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">Abort</button>
                    <button type="submit" disabled={submitting} className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">
                      {submitting ? "Transmitting..." : "Authorize Briefing"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Meeting Feed */}
          <div className="space-y-4">
            {loading ? (
              [...Array(3)].map((_, i) => <div key={i} className="h-24 bg-secondary/30 animate-pulse rounded-2xl" />)
            ) : meetings.length === 0 ? (
              <div className="glass rounded-[2rem] p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No active protocols scheduled</p>
              </div>
            ) : (
              meetings.map((m, idx) => (
                <motion.div key={m._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                  className="glass rounded-3xl p-6 flex items-center justify-between group hover:border-primary/20 transition-all border-primary/5 shadow-xl shadow-black/5"
                >
                  <div className="flex items-center gap-6 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-secondary flex flex-col items-center justify-center border border-border group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                      <span className="text-[10px] font-black text-primary uppercase leading-tight">{format(parseISO(m.startTime), "MMM")}</span>
                      <span className="text-xl font-black text-foreground leading-tight">{format(parseISO(m.startTime), "dd")}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-lg text-foreground group-hover:text-primary transition-colors">{m.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {format(parseISO(m.startTime), "hh:mm a")} — {format(parseISO(m.endTime), "hh:mm a")}</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {m.attendees?.length || 0} OPERATIVES</span>
                        {m.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {m.location}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className={cn("text-[9px] px-2 py-1 rounded-lg font-black uppercase tracking-widest border", 
                        m.status === "scheduled" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20")}>
                        {m.status}
                     </span>
                     {m.meetingLink && (
                        <a href={m.meetingLink} target="_blank" className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-110 transition-transform">
                          <Video className="w-4 h-4" />
                        </a>
                     )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar Calendar */}
        <div className="space-y-6">
           <div className="glass rounded-[2rem] p-8 border-primary/5 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-sm uppercase tracking-widest text-foreground">{format(currentDate, "MMMM yyyy")}</h3>
                <div className="flex gap-1">
                  <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-secondary rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {["S","M","T","W","T","F","S"].map((d, i) => (
                  <div key={i} className="text-center text-[10px] font-black text-muted-foreground">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => <div key={i} />)}
                {days.map((day) => {
                  const hasMeeting = meetingDates.some((md) => isSameDay(md, day));
                  const isToday = isSameDay(day, new Date());
                  return (
                    <motion.div key={day.toISOString()} whileHover={{ scale: 1.1 }}
                      className={cn(
                        "aspect-square flex items-center justify-center rounded-xl text-[10px] font-black relative cursor-pointer border transition-all",
                        isToday ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "hover:bg-secondary/50 text-foreground border-transparent",
                        hasMeeting && !isToday && "ring-1 ring-primary/30"
                      )}
                    >
                      {format(day, "d")}
                      {hasMeeting && !isToday && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />}
                    </motion.div>
                  );
                })}
              </div>
           </div>

           <div className="glass rounded-[2rem] p-8 border-primary/5 shadow-xl">
              <h3 className="font-black text-[10px] uppercase tracking-widest text-muted-foreground mb-6">Immediate Intel</h3>
              <div className="space-y-4">
                  <div className="p-4 bg-secondary/30 rounded-2xl border border-border/50">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Response Protocol</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">Ensure all mission critical briefed prior to commencement.</p>
                  </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
