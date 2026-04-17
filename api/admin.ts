import type { IncomingMessage, ServerResponse } from "node:http";

function sendHtml(res: ServerResponse, html: string): void {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(html);
}

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method !== "GET") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method not allowed" }));
    return;
  }

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GKIS LMS Backend Admin</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0f172a;
      --card: #111827;
      --muted: #94a3b8;
      --text: #f8fafc;
      --accent: #22c55e;
      --accent-2: #38bdf8;
      --danger: #ef4444;
      --border: #1f2937;
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
    .container {
      max-width: 900px;
      margin: 0 auto;
      display: grid;
      gap: 16px;
    }
    .card {
      background: rgba(17, 24, 39, 0.85);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      backdrop-filter: blur(6px);
    }
    h1, h2, h3 { margin: 0 0 12px 0; }
    h1 { font-size: 1.4rem; }
    h2 { font-size: 1.1rem; color: var(--accent-2); }
    p { margin: 6px 0; color: var(--muted); }
    .row { display: flex; flex-wrap: wrap; gap: 8px; }
    button {
      background: #1e293b;
      color: #e2e8f0;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
    }
    button:hover { border-color: var(--accent-2); }
    button.primary { border-color: var(--accent); color: #dcfce7; }
    button.danger { border-color: var(--danger); color: #fecaca; }
    input {
      background: #0b1220;
      color: #f8fafc;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 10px 12px;
      width: 100%;
    }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
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
    .small { font-size: 0.9rem; color: var(--muted); }
    @media (max-width: 740px) {
      .grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h1>GKIS LMS Backend Admin</h1>
      <p>Use this page to test backend endpoints quickly.</p>
      <p class="small">Base URL: <span id="baseUrl"></span></p>
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
      <h2>Authentication</h2>
      <div class="grid">
        <input id="email" placeholder="email (e.g. admin@gkislms.local)" value="admin@gkislms.local" />
        <input id="password" placeholder="password (e.g. admin123)" value="admin123" />
      </div>
      <div class="row" style="margin-top:8px;">
        <button class="primary" onclick="login()">POST /auth/login</button>
        <button onclick="copyToken()">Copy Token</button>
        <button class="danger" onclick="clearToken()">Clear Token</button>
      </div>
      <p class="small">Saved token: <span id="tokenStatus">Not set</span></p>
    </div>

    <div class="card">
      <h2>Response</h2>
      <pre id="output">Ready.</pre>
    </div>
  </div>

  <script>
    const baseUrl = window.location.origin;
    const output = document.getElementById("output");
    const tokenStatus = document.getElementById("tokenStatus");
    document.getElementById("baseUrl").textContent = baseUrl;

    function getToken() {
      return localStorage.getItem("gkis_token") || "";
    }

    function setToken(token) {
      if (token) {
        localStorage.setItem("gkis_token", token);
      } else {
        localStorage.removeItem("gkis_token");
      }
      tokenStatus.textContent = token ? token.slice(0, 24) + "..." : "Not set";
    }

    setToken(getToken());

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

    async function login() {
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      try {
        const res = await fetch(baseUrl + "/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok && data.token) {
          setToken(data.token);
        }
        print({ status: res.status, path: "/auth/login", data });
      } catch (err) {
        print({ error: String(err) });
      }
    }

    async function callMe() {
      const token = getToken();
      try {
        const res = await fetch(baseUrl + "/me", {
          headers: token ? { Authorization: "Bearer " + token } : {}
        });
        const data = await res.json();
        print({ status: res.status, path: "/me", data });
      } catch (err) {
        print({ error: String(err) });
      }
    }

    async function copyToken() {
      const token = getToken();
      if (!token) {
        print("No token to copy.");
        return;
      }
      await navigator.clipboard.writeText(token);
      print("Token copied to clipboard.");
    }

    function clearToken() {
      setToken("");
      print("Token cleared.");
    }
  </script>
</body>
</html>`;

  sendHtml(res, html);
}
