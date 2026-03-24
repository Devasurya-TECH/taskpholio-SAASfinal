import { supabase } from "@/lib/supabase";

interface PushPayload {
  userIds: string[];
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function sendPushToUsers(payload: PushPayload): Promise<void> {
  const userIds = Array.from(new Set((payload.userIds || []).filter(Boolean)));
  if (userIds.length === 0) return;

  try {
    const { error } = await supabase.functions.invoke("send-push", {
      body: {
        userIds,
        title: payload.title,
        body: payload.body,
        url: payload.url || "/dashboard/notifications",
        tag: payload.tag || "taskpholio-update",
      },
    });

    if (error) {
      console.error("Push invoke failed:", error.message || error);
    }
  } catch (error) {
    console.error("Push invoke crashed:", error);
  }
}
