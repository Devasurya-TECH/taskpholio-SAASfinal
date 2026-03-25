"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Camera, Mail, Shield, User as UserIcon, Loader2, Briefcase, Zap, Key, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getDisplayName, getInitial, getRoleColor } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { uploadAttachments } from "@/lib/uploadAttachments";

const resolveToken = (fallbackToken: string | null): string => {
  if (fallbackToken) return fallbackToken;
  if (typeof window === "undefined") return "";
  return localStorage.getItem("taskpholio_token") || sessionStorage.getItem("taskpholio_token") || "";
};

const ProfileField = ({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: any;
  label: string;
  value: string;
  sub: string;
}) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
      <Icon className="w-3.5 h-3.5" />
      {label}
    </label>
    <div className="bg-secondary/35 border border-border/60 rounded-2xl px-5 py-4 min-h-[78px] flex flex-col justify-center">
      <p className="text-sm font-black text-foreground tracking-tight break-words">{value}</p>
      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-1">{sub}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const { user, token, setAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected || !user) return;

    setUploading(true);
    try {
      const result = await uploadAttachments([selected], { imageOnly: true, maxSizeBytes: 5 * 1024 * 1024 });
      if (result.uploaded.length === 0) {
        throw new Error(result.failed[0]?.reason || "Image upload failed.");
      }

      const avatarUrl = result.uploaded[0].fileUrl;
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("id", user._id);

      if (error) throw error;

      setAuth({ ...user, avatar: avatarUrl }, resolveToken(token));
      toast.success("Profile photo updated.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  const displayName = getDisplayName(user.name, user.email);
  const roleLabel = `${user.role} Class`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl border border-border/60 p-6 md:p-8"
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="relative mx-auto lg:mx-0">
            <div className="relative h-40 w-40 overflow-hidden rounded-[2rem] border-2 border-primary/35 bg-secondary shadow-[0_0_35px_rgba(34,197,94,0.18)]">
              {user.avatar ? (
                <img src={user.avatar} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/12 to-secondary">
                  <span className="text-5xl font-black text-primary/75">{getInitial(user.name, user.email)}</span>
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <Loader2 className="h-9 w-9 animate-spin text-primary" />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-3 -right-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-primary/30 bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
              aria-label="Upload profile photo"
            >
              <Camera className="h-5 w-5" />
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">Operative Dossier</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">{displayName}</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep profile details aligned so assignment routing, notifications, and team visibility stay accurate.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</p>
                <p className="mt-1 text-sm font-black text-foreground">{user.role}</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                <p className="mt-1 text-sm font-black text-emerald-400">Active</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-secondary/30 px-4 py-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Profile Photo</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-1 inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Upload New
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-background/30 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Identity Verification</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Profile data is linked to task notifications, team dashboards, and assignment permissions.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass rounded-3xl border border-border/60 p-6 md:p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-black text-foreground">Identity Parameters</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <ProfileField icon={UserIcon} label="Full Name" value={displayName} sub="Official Operative Designation" />
          <ProfileField icon={Mail} label="Matrix Address" value={user.email} sub="Secure Communication Link" />
          <ProfileField icon={Key} label="Access Tier" value={roleLabel} sub="Assigned Authorization Level" />
          <ProfileField
            icon={Briefcase}
            label="Strategic Division"
            value={typeof user.team === "object" ? user.team?.name || "Unassigned" : user.team || "Unassigned"}
            sub="Current Tactical Group"
          />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 md:grid-cols-3"
      >
        <div className="glass rounded-2xl border border-emerald-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reputation</p>
            <p className="mt-1 text-xl font-black text-emerald-400">98%</p>
          </div>
          <Zap className="h-5 w-5 text-emerald-400" />
        </div>

        <div className="glass rounded-2xl border border-primary/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role Signature</p>
            <p className={`mt-1 inline-flex rounded-lg border px-2 py-1 text-xs font-black uppercase tracking-widest ${getRoleColor(user.role)}`}>
              {user.role}
            </p>
          </div>
          <Shield className="h-5 w-5 text-primary" />
        </div>

        <div className="glass rounded-2xl border border-blue-500/20 p-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Commendations</p>
            <p className="mt-1 text-xl font-black text-blue-400">12</p>
          </div>
          <Key className="h-5 w-5 text-blue-400" />
        </div>
      </motion.section>
    </div>
  );
}

