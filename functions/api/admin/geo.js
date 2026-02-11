export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const pass = env.PASSWORD || "";
  if (!pass || !auth.startsWith("Bearer ") || auth.slice(7) !== pass) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
  }
  try {
    const u = new URL(request.url);
    const ip = (u.searchParams.get("ip") || "").trim();
    if (!ip) {
      return new Response(JSON.stringify({ error: "bad_request" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    const api = `https://ip-api.com/json/${encodeURIComponent(ip)}?lang=zh-CN`;
    const r = await fetch(api, { headers: { "Accept": "application/json" } });
    if (!r.ok) {
      return new Response(JSON.stringify({ error: "upstream_error" }), { status: 502, headers: { "Content-Type": "application/json" } });
    }
    const j = await r.json().catch(() => null);
    if (!j || j.status !== "success") {
      return new Response(JSON.stringify({ error: "lookup_failed" }), { status: 502, headers: { "Content-Type": "application/json" } });
    }
    const country = j.country || "";
    const region = j.regionName || "";
    const city = j.city || "";
    const loc = [country, region, city].filter(Boolean).join(" · ");
    return new Response(JSON.stringify({ ip, location: loc || country || "" }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
