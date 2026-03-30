import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type MeetingEmailRequest = {
  userIds?: string[];
  meetingId?: string;
  meetingTitle?: string;
  meetingDescription?: string;
  scheduledAt?: string;
  meetingLink?: string;
  organizerName?: string;
  location?: string;
};

type Recipient = {
  id: string;
  full_name?: string | null;
  email: string;
};

const isValidEmail = (value?: string | null): value is string => {
  if (!value) return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDateTime = (raw?: string): string => {
  if (!raw) return "Not specified";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const renderMeetingEmail = (options: {
  receiverName: string;
  meetingTitle: string;
  meetingDescription: string;
  scheduledAt: string;
  organizerName: string;
  meetingUrl: string;
  meetingLink: string;
  location: string;
}) => `
  <div style="font-family:Arial,sans-serif;background:#070912;color:#f5f7ff;padding:24px;">
    <div style="max-width:640px;margin:0 auto;border:1px solid rgba(255,255,255,0.15);border-radius:16px;background:#11162a;padding:24px;">
      <h2 style="margin:0 0 12px;font-size:22px;color:#8b95ff;">Taskpholio</h2>
      <p style="margin:0 0 14px;font-size:14px;opacity:0.88;">Hi ${escapeHtml(options.receiverName)},</p>
      <p style="margin:0 0 18px;font-size:14px;line-height:1.6;">
        A new meeting has been scheduled by <strong>${escapeHtml(options.organizerName)}</strong>.
      </p>
      <div style="border:1px solid rgba(255,255,255,0.12);border-radius:12px;padding:14px;background:#0c1020;">
        <p style="margin:0 0 8px;font-size:13px;opacity:0.78;">Meeting</p>
        <p style="margin:0 0 12px;font-size:18px;font-weight:700;color:#e7ebff;">${escapeHtml(options.meetingTitle)}</p>
        <p style="margin:0 0 8px;font-size:13px;opacity:0.78;">Description</p>
        <p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:#d4d9ff;">${escapeHtml(options.meetingDescription || "No description provided.")}</p>
        <p style="margin:0 0 8px;font-size:13px;"><strong>Schedule:</strong> ${escapeHtml(options.scheduledAt)}</p>
        <p style="margin:0 0 8px;font-size:13px;"><strong>Location:</strong> ${escapeHtml(options.location)}</p>
        ${
          options.meetingLink
            ? `<p style="margin:0;font-size:13px;"><strong>Join Link:</strong> <a href="${options.meetingLink}" style="color:#9fa8ff;">${escapeHtml(options.meetingLink)}</a></p>`
            : ""
        }
      </div>
      <a href="${options.meetingUrl}" style="display:inline-block;margin-top:18px;padding:11px 16px;border-radius:10px;background:#5965ff;color:white;text-decoration:none;font-weight:700;">
        Open Meetings
      </a>
    </div>
  </div>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") ?? "";
    const emailFrom = Deno.env.get("EMAIL_FROM") ?? "LabsRebound <noreply@admin.labsrebound.com>";
    const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://admin.labsrebound.com";

    if (!supabaseUrl || !serviceKey) {
      return new Response(JSON.stringify({ success: false, error: "Missing Supabase environment variables." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    let fallbackOrganizerName = "Leadership";
    const authHeader = req.headers.get("Authorization");
    const token =
      authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : "";
    if (token) {
      const { data: authData } = await admin.auth.getUser(token);
      const actorId = authData?.user?.id;
      if (actorId) {
        const { data: actorProfile } = await admin
          .from("profiles")
          .select("full_name, email")
          .eq("id", actorId)
          .maybeSingle();
        fallbackOrganizerName = actorProfile?.full_name || actorProfile?.email || fallbackOrganizerName;
      }
    }

    const payload = (await req.json()) as MeetingEmailRequest;
    const userIds = Array.from(new Set((payload.userIds || []).filter(Boolean)));
    if (!userIds.length || !payload.meetingTitle) {
      return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, skipped: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          sent: 0,
          failed: userIds.length,
          skipped: userIds.length,
          reason: "Missing RESEND_API_KEY",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: recipients, error: recipientError } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    if (recipientError) {
      return new Response(JSON.stringify({ success: false, error: recipientError.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const recipientMap = new Map<string, { full_name?: string | null; email?: string | null }>();
    (recipients || []).forEach((entry: any) => {
      recipientMap.set(entry.id, {
        full_name: entry?.full_name ?? null,
        email: entry?.email ?? null,
      });
    });

    const resolvedRecipients: Recipient[] = [];
    for (const userId of userIds) {
      const profile = recipientMap.get(userId);
      let resolvedEmail = profile?.email?.trim() || "";
      let resolvedName = profile?.full_name || null;

      if (!isValidEmail(resolvedEmail)) {
        const { data: authUserData, error: authUserError } = await admin.auth.admin.getUserById(userId);
        if (!authUserError) {
          resolvedEmail = authUserData?.user?.email?.trim() || "";
          if (!resolvedName) {
            resolvedName = authUserData?.user?.user_metadata?.full_name || authUserData?.user?.email || null;
          }
        }
      }

      if (!isValidEmail(resolvedEmail)) continue;
      resolvedRecipients.push({
        id: userId,
        full_name: resolvedName,
        email: resolvedEmail,
      });
    }

    const validRecipients = resolvedRecipients;
    if (!validRecipients.length) {
      return new Response(JSON.stringify({ success: true, sent: 0, failed: 0, skipped: userIds.length }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const meetingTitle = payload.meetingTitle || "Meeting";
    const meetingDescription = payload.meetingDescription || "";
    const organizerName = payload.organizerName || fallbackOrganizerName;
    const meetingLink = payload.meetingLink || "";
    const location = payload.location || "Virtual HQ";
    const scheduledAt = formatDateTime(payload.scheduledAt);
    const meetingUrl = `${appBaseUrl.replace(/\/+$/, "")}/dashboard/meetings`;
    const subject = `New meeting scheduled: ${meetingTitle}`;

    let sent = 0;
    let failed = 0;
    const failedReasons: string[] = [];

    for (const recipient of validRecipients) {
      try {
        const html = renderMeetingEmail({
          receiverName: recipient.full_name || recipient.email || "Member",
          meetingTitle,
          meetingDescription,
          scheduledAt,
          organizerName,
          meetingUrl,
          meetingLink,
          location,
        });

        const resendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: emailFrom,
            to: [recipient.email],
            subject,
            html,
          }),
        });

        if (!resendResponse.ok) {
          const errorText = await resendResponse.text();
          const reason = `Failed for ${recipient.email}: ${resendResponse.status} ${errorText}`;
          console.error(reason);
          failedReasons.push(reason);
          failed += 1;
          continue;
        }

        sent += 1;
      } catch {
        const reason = `Failed for ${recipient.email}: exception while calling Resend`;
        console.error(reason);
        failedReasons.push(reason);
        failed += 1;
      }
    }

    const skipped = Math.max(0, userIds.length - validRecipients.length);
    return new Response(JSON.stringify({ success: true, sent, failed, skipped, failedReasons }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, error: error?.message || "Unexpected error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

