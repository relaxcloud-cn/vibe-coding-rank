const MAX_REPORT_BYTES = 120_000;
const REPORT_TTL_SECONDS = 60 * 60 * 24 * 30;

function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      ...(init.headers || {}),
    },
  });
}

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json({}, { headers: { "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" } });
    }

    if (url.pathname === "/api/reports" && request.method === "POST") {
      if (!env.REPORTS) {
        return json({ error: "REPORTS KV binding is not configured." }, { status: 501 });
      }

      const body = await request.text();
      if (body.length > MAX_REPORT_BYTES) {
        return json({ error: "Report payload is too large." }, { status: 413 });
      }

      let report;
      try {
        report = JSON.parse(body);
      } catch {
        return json({ error: "Invalid JSON payload." }, { status: 400 });
      }

      const id = (await sha256(`${Date.now()}:${body}`)).slice(0, 16);
      await env.REPORTS.put(id, JSON.stringify({ id, report, createdAt: new Date().toISOString() }), {
        expirationTtl: REPORT_TTL_SECONDS,
      });

      return json({ id, url: `${url.origin}/#id=${id}` });
    }

    const match = url.pathname.match(/^\/api\/reports\/([a-zA-Z0-9_-]{6,64})$/);
    if (match && request.method === "GET") {
      if (!env.REPORTS) {
        return json({ error: "REPORTS KV binding is not configured." }, { status: 501 });
      }
      const stored = await env.REPORTS.get(match[1]);
      if (!stored) return json({ error: "Report not found." }, { status: 404 });
      return json(JSON.parse(stored));
    }

    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return json({ error: "Not found." }, { status: 404 });
  },
};
