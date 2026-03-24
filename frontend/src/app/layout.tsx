"use client";
import "./globals.css";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { SocketProvider } from "@/providers/SocketProvider";
import LogRocketInit from "@/components/LogRocketInit";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Keep service workers production-only to avoid stale chunk/cache issues in local dev.
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("✅ Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.error("❌ Service Worker registration failed:", error);
          });
      });
    }

    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });

      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys
            .filter((key) => key.startsWith("taskpholio-"))
            .forEach((key) => caches.delete(key));
        });
      }
    }

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <meta name="theme-color" content="#0a0a0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Taskpholio" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body>
        <LogRocketInit />
        <SocketProvider>
          {children}
        </SocketProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
