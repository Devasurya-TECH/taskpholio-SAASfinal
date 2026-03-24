"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import "../auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("auth/forgot-password", { email });
      setIsSent(true);
      toast.success("Recovery email sent!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send recovery email.");
    } finally {
      setIsLoading(false);
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
        {/* Logo */}
        <div className="auth-logo-header">
          <div className="auth-logo-icon glow">
            <Zap size={20} />
          </div>
          <div>
            <h1 className="auth-logo-title">Taskpholio</h1>
            <p className="auth-logo-subtitle">Recovery Center</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card glass">
          {!isSent ? (
            <>
              <div>
                <h2 className="auth-card-title">Forgot password?</h2>
                <p className="auth-card-subtitle">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="auth-form">
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
                    "Send Reset Link"
                  )}
                </motion.button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ 
                width: '4rem', height: '4rem', backgroundColor: 'rgba(0,180,0,0.1)', 
                border: '1px solid rgba(0,180,0,0.2)', borderRadius: '50%', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                margin: '0 auto 1rem auto' 
              }}>
                <CheckCircle2 size={32} color="#00dd00" />
              </div>
              <h2 className="auth-card-title">Email Sent!</h2>
              <p className="auth-card-subtitle">
                We&apos;ve sent a password reset link to <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{email}</span>. 
                Please check your inbox.
              </p>
              <button 
                onClick={() => setIsSent(false)}
                className="auth-link"
                style={{ marginTop: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Didn&apos;t receive the email? Try again
              </button>
            </div>
          )}

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', marginTop: '1.5rem', textAlign: 'center' }}>
            <Link 
              href="/login" 
              className="auth-link"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
