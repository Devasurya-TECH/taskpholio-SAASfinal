"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, Lock, User, Briefcase, ArrowRight, Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import "../auth.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("CTO");
  const [staySignedIn, setStaySignedIn] = useState(true);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    try {
      const hasSession = await register(name, email, password, role, undefined, staySignedIn);
      router.push(hasSession ? "/dashboard" : "/login");
    } catch (err: any) {
      toast.error(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-glow-bg" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="auth-card-wrapper"
      >
        <div className="auth-logo-header">
          <div className="auth-logo-icon glow">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="auth-logo-title">Taskpholio</h1>
            <p className="auth-logo-subtitle">Team Management Platform</p>
          </div>
        </div>

        <div className="auth-card glass">
          <div>
            <h2 className="auth-card-title">Create an Account</h2>
            <p className="auth-card-subtitle">Join the high-command network</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={16} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={16} />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={16} />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="auth-input"
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Role Designation</label>
              <div className="auth-input-wrapper">
                <Briefcase className="auth-input-icon" size={16} />
                <select 
                  value={role} 
                  onChange={(e) => setRole(e.target.value)} 
                  className="auth-input"
                  style={{ appearance: 'none' }}
                >
                  <option value="CTO">CTO (Admin)</option>
                  <option value="CEO">CEO (Admin)</option>
                  <option value="member">Operative (Member)</option>
                </select>
              </div>
            </div>

            <div className="auth-options">
              <label className="auth-checkbox-label group">
                <input
                  type="checkbox"
                  checked={staySignedIn}
                  onChange={(e) => setStaySignedIn(e.target.checked)}
                  className="auth-checkbox"
                />
                <span>Stay signed in</span>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>Register <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link href="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
