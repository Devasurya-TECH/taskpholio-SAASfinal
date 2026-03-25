import { supabase } from "@/lib/supabase";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

type SubscriptionKeys = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function extractSubscriptionKeys(subscription: PushSubscription): SubscriptionKeys | null {
  const json = subscription.toJSON();
  const endpoint = json.endpoint;
  const p256dh = json.keys?.p256dh;
  const auth = json.keys?.auth;
  if (!endpoint || !p256dh || !auth) return null;
  return { endpoint, p256dh, auth };
}

function isRecoverableSubscriptionConflict(error: { message?: string } | null): boolean {
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("row-level security") ||
    message.includes("duplicate key") ||
    message.includes("conflict") ||
    message.includes("violates")
  );
}

export async function registerPushSubscription(): Promise<void> {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
  if (!vapidPublicKey) {
    console.error("Push subscription skipped: NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.");
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData?.session?.user?.id;
  if (!userId) return;

  if (Notification.permission === "denied") return;

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") return;

  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    registration = await navigator.serviceWorker.register("/service-worker.js");
  }
  if (!registration) return;

  if (!registration.active) {
    await navigator.serviceWorker.ready;
    registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;
  }

  let subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const current = extractSubscriptionKeys(subscription);
    if (!current) {
      await subscription.unsubscribe().catch(() => undefined);
      subscription = null;
    } else {
      // If this endpoint belongs to another account on this device, force a fresh subscription.
      const { data: ownExisting } = await supabase
        .from("push_subscriptions")
        .select("id")
        .eq("user_id", userId)
        .eq("endpoint", current.endpoint)
        .maybeSingle();

      if (!ownExisting) {
        await subscription.unsubscribe().catch(() => undefined);
        subscription = null;
      }
    }
  }

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
  }

  if (!subscription) return;

  const persist = async (keys: SubscriptionKeys) =>
    supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint: keys.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        user_agent: navigator.userAgent,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" }
    );

  let keys = extractSubscriptionKeys(subscription);
  if (!keys) return;

  let { error } = await persist(keys);

  if (error && isRecoverableSubscriptionConflict(error)) {
    await subscription.unsubscribe().catch(() => undefined);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });
    keys = subscription ? extractSubscriptionKeys(subscription) : null;
    if (keys) {
      const retry = await persist(keys);
      error = retry.error;
    }
  }

  if (error) {
    console.error("Failed to store push subscription:", error);
  }
}
