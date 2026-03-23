"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Camera, Mail, Shield, User as UserIcon, Loader2, Briefcase, Zap, Key } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import { cn, getRoleColor } from "@/lib/utils";

const ProfileField = ({ icon: Icon, label, value, sub }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
      <Icon className="w-3 h-3" />
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-0 bg-primary/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-secondary/30 border border-white/5 rounded-2xl px-6 py-4 flex flex-col gap-1 transition-all group-hover:border-primary/20">
        <p className="text-sm font-black text-foreground tracking-tight">{value}</p>
        <p className="text-[9px] font-medium text-muted-foreground italic uppercase tracking-widest">{sub}</p>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("INTEL BLOCKED: Only images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("INTEL BLOCKED: File size must be less than 5MB.");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.patch("profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updatedUser = res.data.data.user;
      const currentToken = localStorage.getItem("taskpholio_token") || "";
      setAuth(updatedUser, currentToken);
      toast.success("Identity Verified: Avatar updated.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Tactical Failure: Failed to update identity.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 p-4 md:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black text-foreground tracking-tight uppercase">Operative Dossier</h1>
        <p className="text-muted-foreground font-black uppercase tracking-[0.2em] text-[10px] mt-2">Personal Intelligence & Access Credentials</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Avatar Section */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:col-span-4 flex flex-col items-center">
          <div className="relative group">
            <div className="absolute -inset-4 bg-primary/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-64 h-64 rounded-[3.5rem] overflow-hidden border-8 border-secondary bg-secondary shadow-2xl transition-transform group-hover:scale-[1.02]">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={256} height={256} className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
                   <UserIcon className="w-24 h-24 text-primary opacity-40" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
              )}
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-4 -right-4 w-16 h-16 bg-primary text-primary-foreground rounded-[2rem] flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] z-30 group-hover:rotate-12 transition-all"
            >
              <Camera className="w-6 h-6" />
            </motion.button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          <div className="mt-12 w-full glass p-8 rounded-[2rem] border border-white/5 space-y-4">
             <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ID Status</p>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                </div>
             </div>
             <p className="text-[10px] text-muted-foreground leading-relaxed italic">Biometric identity verified via secure cloud sync. Operative is cleared for tactical maneuvers.</p>
          </div>
        </motion.div>

        {/* Intelligence Data */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-8 flex flex-col gap-8">
           <div className="glass rounded-[3rem] p-10 border border-white/5 shadow-2xl space-y-8">
              <div className="flex items-center gap-4 mb-4">
                 <Shield className="w-6 h-6 text-primary" />
                 <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Identity Parameters</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProfileField icon={UserIcon} label="Full Name" value={user.name} sub="Official Operative Designation" />
                <ProfileField icon={Mail} label="Matrix Address" value={user.email} sub="Secure Communication Link" />
                <ProfileField icon={Key} label="Access Tier" value={`${user.role} Class`} sub="Assigned Authorization Level" />
                <ProfileField icon={Briefcase} label="Strategic Division" value={typeof user.team === 'object' ? user.team?.name : user.team || "Independent"} sub="Current Tactical Group" />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-black">
              <div className="glass p-6 rounded-2xl border-emerald-500/10 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Reputation</p>
                    <p className="text-xl text-emerald-400">98%</p>
                 </div>
                 <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="glass p-6 rounded-2xl border-primary/10 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Operations</p>
                    <p className="text-xl text-primary">124</p>
                 </div>
                 <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="glass p-6 rounded-2xl border-purple-500/10 flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Commendations</p>
                    <p className="text-xl text-purple-400">12</p>
                 </div>
                 <Key className="w-5 h-5 text-purple-400" />
              </div>
           </div>
        </motion.div>
      </div>
    </div>
  );
}
