"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { Camera, Mail, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Only images are allowed.");
    }
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("File size must be less than 5MB.");
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.patch("/profile/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      // Update local storage and store
      const updatedUser = res.data.data.user;
      const currentToken = localStorage.getItem("taskpholio_token") || "";
      setAuth(updatedUser, currentToken);
      toast.success("Avatar updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update avatar.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Profile Settings</h2>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary bg-secondary flex items-center justify-center">
              {user.avatar ? (
                <Image src={user.avatar} alt={user.name} width={128} height={128} className="object-cover w-full h-full" />
              ) : (
                <UserIcon className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg hover:scale-105 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-semibold">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  disabled
                  value={user.name}
                  className="pl-10 w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-semibold">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="pl-10 w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block uppercase tracking-wider font-semibold">Role & Access Level</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  disabled
                  value={user.role}
                  className="pl-10 w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm text-foreground opacity-70 cursor-not-allowed"
                />
              </div>
            </div>

            {user.team && (
              <div className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                  Team: {typeof user.team === 'object' ? user.team.name : user.team}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
