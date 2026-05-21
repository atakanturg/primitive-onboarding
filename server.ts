import { createClient } from "@supabase/supabase-js";

export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/api/onboard") {
      return handleOnboard(request, env);
    }

    // SPA fallback
    if (env.ASSETS) {
      const res = await env.ASSETS.fetch(request);
      if (res.status === 404) {
        return env.ASSETS.fetch(new Request(new URL("/index.html", request.url).toString(), request));
      }
      return res;
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleOnboard(request: Request, env: any): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  };

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid request body" }), { status: 400, headers: cors });
  }

  const { name, email, role, message, userId } = body;

  if (!email || !role) {
    return new Response(JSON.stringify({ message: "email and role are required" }), { status: 400, headers: cors });
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  // Load the user's saved mappings to find which channels this role belongs to
  const { data: setup } = await supabase
    .from("slack_setup")
    .select("mappings, bot_connected")
    .eq("user_id", userId)
    .maybeSingle();

  if (!setup?.bot_connected) {
    return new Response(JSON.stringify({ message: "Slack bot not connected" }), { status: 400, headers: cors });
  }

  const mappings: { role: string; channels: string }[] = setup?.mappings ?? [];
  const match = mappings.find(m => m.role.toLowerCase() === role.toLowerCase());
  const channels = match ? match.channels.split(",").map((c: string) => c.trim()).filter(Boolean) : [];

  // Post to Slack channels if bot token is configured
  const errors: string[] = [];
  if (env.SLACK_BOT_TOKEN && channels.length) {
    for (const channel of channels) {
      const slackRes = await fetch("https://slack.com/api/chat.postMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
        },
        body: JSON.stringify({
          channel: channel.startsWith("#") ? channel : `#${channel}`,
          text: message
            ? `👋 Welcome *${name || email}* (${role})!\n\n${message}`
            : `👋 Welcome *${name || email}* (${role})!`,
        }),
      });
      const slackData: any = await slackRes.json();
      if (!slackData.ok) errors.push(`${channel}: ${slackData.error}`);
    }
  }

  // Log the run regardless of Slack result
  await supabase.from("onboarding_runs").insert({
    user_id: userId,
    employee_name: name || null,
    employee_email: email,
    employee_role: role,
    message: message || null,
    status: errors.length ? "partial" : "complete",
    result: { channels, errors },
  });

  if (errors.length) {
    return new Response(
      JSON.stringify({ message: `Provisioned with errors: ${errors.join("; ")}` }),
      { status: 207, headers: cors }
    );
  }

  return new Response(
    JSON.stringify({ message: `${name || email} provisioned into ${channels.length} channel(s).` }),
    { status: 200, headers: cors }
  );
}
