import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { SocketProvider } from "@/providers/SocketProvider";
import LogRocketInit from "@/components/LogRocketInit";

export const metadata: Metadata = {
  title: "Taskpholio – Team Task Management",
  description: "Hierarchical, role-based task management platform for modern teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
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
