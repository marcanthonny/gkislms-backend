import type { IncomingMessage, ServerResponse } from "node:http";
import { users } from "../src/data/users";
import { createToken, verifyToken } from "../src/utils/auth";

const ADMIN_COOKIE_NAME = "gkis_admin_token";
const COOKIE_TTL_SECONDS = 60 * 60 * 8;

function sendHtml(res: ServerResponse, html: string, statusCode = 200): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(html);
}

function redirect(res: ServerResponse, location: string): void {
  res.statusCode = 302;
  res.setHeader("Location", location);
  res.end();
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(";")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const [key, ...rest] = item.split("=");
      if (!key || rest.length === 0) {
        return acc;
      }
      acc[key] = decodeURIComponent(rest.join("="));
      return acc;
    }, {});
}

async function readFormBody(req: IncomingMessage): Promise<Record<string, string>> {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const body = Buffer.concat(chunks).toString("utf8");
  const params = new URLSearchParams(body);
  const data: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

function setAdminCookie(res: ServerResponse, token: string): void {
  res.setHeader(
    "Set-Cookie",
    `${ADMIN_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${COOKIE_TTL_SECONDS}`,
  );
}

function clearAdminCookie(res: ServerResponse): void {
  res.setHeader("Set-Cookie", `${ADMIN_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=0`);
}

function getValidAdminUser(req: IncomingMessage): { email: string; name: string } | null {
  const token = parseCookies(req.headers.cookie)[ADMIN_COOKIE_NAME];
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "Admin") {
    return null;
  }

  return { email: payload.email, name: payload.name };
}

function adminLoginPage(errorMessage?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GKIS Admin Login</title>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: linear-gradient(120deg, #020617, #0f172a);
      font-family: Inter, Segoe UI, system-ui, sans-serif;
      color: #f8fafc;
      padding: 20px;
    }
    .card {
      width: 100%;
      max-width: 420px;
      background: rgba(17, 24, 39, 0.9);
      border: 1px solid #1f2937;
      border-radius: 12px;
      padding: 18px;
    }
    h1 { margin: 0 0 8px 0; font-size: 1.3rem; }
    p { margin: 0 0 14px 0; color: #94a3b8; }
    .error {
      margin: 0 0 12px 0;
      color: #fecaca;
      background: rgba(127, 29, 29, 0.3);
      border: 1px solid #7f1d1d;
      border-radius: 8px;
      padding: 10px;
      font-size: 0.9rem;
    }
    label { display: block; margin: 10px 0 6px 0; color: #cbd5e1; }
    input {
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #334155;
      background: #0b1220;
      color: #f8fafc;
      box-sizing: border-box;
    }
    button {
      margin-top: 14px;
      width: 100%;
      padding: 10px 12px;
      border-radius: 8px;
      border: 1px solid #22c55e;
      background: #052e16;
      color: #dcfce7;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <form class="card" method="POST" action="/admin">
    <h1>Backend Admin Login</h1>
    <p>Sign in with an admin account to access /admin.</p>
    ${errorMessage ? `<div class="error">${errorMessage}</div>` : ""}
    <label for="email">Email</label>
    <input id="email" name="email" type="email" required value="admin@gkislms.local" />
    <label for="password">Password</label>
    <input id="password" name="password" type="password" required value="admin123" />
    <button type="submit">Sign in</button>
  </form>
</body>
</html>`;
}

function adminPanelPage(adminName: string, adminEmail: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GKIS LMS Backend Admin</title>
  <style>
    :root {
      color-scheme: light dark;
      --card: #111827;
      --muted: #94a3b8;
      --text: #f8fafc;
      --accent-2: #38bdf8;
      --border: #1f2937;
      --danger: #ef4444;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Segoe UI, system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #020617, #0f172a);
      color: var(--text);
      min-height: 100vh;
      padding: 24px;
    }
    .container { max-width: 900px; margin: 0 auto; display: grid; gap: 16px; }
    .card {
      background: rgba(17, 24, 39, 0.85);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
    }
    h1, h2 { margin: 0 0 12px 0; }
    h2 { font-size: 1.1rem; color: var(--accent-2); }
    p { margin: 6px 0; color: var(--muted); }
    .row { display: flex; flex-wrap: wrap; gap: 8px; }
    button, a.button {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }
    a.button.danger { border-color: var(--danger); color: #fecaca; }
    pre {
      margin: 0;
      background: #020617;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 12px;
      overflow: auto;
      min-height: 180px;
      white-space: pre-wrap;
      word-break: break-word;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>GKIS LMS Backend Admin</h1>
      <p>Signed in as ${adminName} (${adminEmail})</p>
      <div class="row">
        <a class="button danger" href="/admin?logout=1">Log out</a>
      </div>
    </div>
    <div class="card">
      <h2>Quick Endpoints</h2>
      <div class="row">
        <button onclick="callGet('/health')">GET /health</button>
        <button onclick="callGet('/roles')">GET /roles</button>
        <button onclick="callGet('/interface')">GET /interface</button>
        <button onclick="callMe()">GET /me</button>
      </div>
    </div>
    <div class="card">
      <h2>Response</h2>
      <pre id="output">Ready.</pre>
    </div>
  </div>
  <script>
    const baseUrl = window.location.origin;
    const output = document.getElementById("output");
    function print(data) {
      output.textContent = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    }
    async function callGet(path) {
      try {
        const res = await fetch(baseUrl + path);
        const data = await res.json();
        print({ status: res.status, path, data });
      } catch (err) {
        print({ error: String(err) });
      }
    }
    async function callMe() {
      try {
        const res = await fetch(baseUrl + "/me");
        const data = await res.json();
        print({ status: res.status, path: "/me", data });
      } catch (err) {
        print({ error: String(err) });
      }
    }
  </script>
</body>
</html>`;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const currentUrl = new URL(req.url ?? "/admin", "http://localhost");

  if (req.method === "GET" && currentUrl.searchParams.get("logout") === "1") {
    clearAdminCookie(res);
    redirect(res, "/admin");
    return;
  }

  if (req.method === "POST") {
    const form = await readFormBody(req);
    const email = (form.email ?? "").trim().toLowerCase();
    const password = form.password ?? "";

    const user = users.find(
      (candidate) => candidate.email.toLowerCase() === email && candidate.password === password,
    );

    if (!user || user.role !== "Admin") {
      sendHtml(res, adminLoginPage("Invalid admin credentials."), 401);
      return;
    }

    const { token } = createToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    setAdminCookie(res, token);
    redirect(res, "/admin");
    return;
  }

  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const admin = getValidAdminUser(req);
  if (!admin) {
    sendHtml(res, adminLoginPage());
    return;
  }

  sendHtml(res, adminPanelPage(admin.name, admin.email));
}
