import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Global CORS Handling
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: "Missing Authorization header" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !caller) {
      return new Response(JSON.stringify({ success: false, error: "Authentication failed: " + (authError?.message ?? "Invalid token") }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: callerProfile, error: profileFetchError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (profileFetchError) {
      return new Response(JSON.stringify({ success: false, error: "Security Check failed: No profile found for admin." }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["ceo", "cto", "admin"].includes(callerProfile?.role?.toLowerCase() ?? "")) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden: Operations access required. Role: " + callerProfile?.role }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { full_name, email, password, role, team } = await req.json();

    // Ensure team is null if empty string to avoid FK constraint violations
    const teamId = team && team.trim() !== "" ? team : null;

    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (error) {
      return new Response(JSON.stringify({ success: false, error: "Auth Error: " + error.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error: upsertError } = await supabaseAdmin.from("profiles").upsert({
      id: newUser.user!.id,
      full_name,
      email,
      role: role.toLowerCase(),
      team: teamId,
      is_active: true,
    });

    if (upsertError) {
      return new Response(JSON.stringify({ success: false, error: "Profile Sync Error: " + upsertError.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Notify Admins
    const { data: admins } = await supabaseAdmin.from("profiles").select("id").in("role", ["ceo", "cto"]);
    if (admins?.length) {
      await supabaseAdmin.from("notifications").insert(
        admins.map((a) => ({
          user_id: a.id,
          type: "member_added",
          title: "New member added",
          body: `${full_name} joined as ${role}${teamId ? ` in squad deployment` : ""}`,
          ref_id: newUser.user!.id,
        }))
      ).catch(e => console.error("Notification failed", e));
    }

    return new Response(
      JSON.stringify({ success: true, userId: newUser.user!.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("GLOBAL FUNCTION CRASH:", err);
    return new Response(JSON.stringify({ success: false, error: "Global System Crash: " + err.message }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
