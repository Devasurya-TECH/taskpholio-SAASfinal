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

  const getFreshAccessToken = async (): Promise<string | null> => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.access_token) return null;

    const expiresSoon =
      typeof session.expires_at === "number" &&
      session.expires_at * 1000 <= Date.now() + 30_000;

    if (!expiresSoon) return session.access_token;

    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (!refreshError && refreshed?.session?.access_token) {
      return refreshed.session.access_token;
    }

    return session.access_token;
  };

  const invokeSendPush = async (accessToken: string) =>
    supabase.functions.invoke("send-push", {
      body: {
        userIds,
        title: payload.title,
        body: payload.body,
        url: payload.url || "/dashboard/notifications",
        tag: payload.tag || "taskpholio-update",
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

  try {
    let accessToken = await getFreshAccessToken();

    if (!accessToken) {
      console.error("Push invoke skipped: no active session token.");
      return;
    }

    let { data, error } = await invokeSendPush(accessToken);
    const errorMessage = String((error as any)?.message || "").toLowerCase();

    if (error && (errorMessage.includes("401") || errorMessage.includes("unauthorized") || errorMessage.includes("jwt"))) {
      const refreshedToken = await getFreshAccessToken();
      if (refreshedToken) {
        accessToken = refreshedToken;
        const retry = await invokeSendPush(accessToken);
        data = retry.data;
        error = retry.error;
      }
    }

    if (error) {
      console.error("Push invoke failed:", error.message || error);
      return;
    }

    if (data?.success === false) {
      console.error("Push function rejected request:", data?.error || "Unknown send-push error");
    }
  } catch (error) {
    console.error("Push invoke crashed:", error);
  }
}
