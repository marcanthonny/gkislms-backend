import type { IncomingMessage, ServerResponse } from "node:http";
import { users } from "../../src/data/users";
import type { LoginRequest } from "../../src/interfaces/auth";
import { createToken } from "../../src/utils/auth";
import { sendJson } from "../../src/utils/http";
import { readJsonBody } from "../../src/utils/request";

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  try {
    const body = await readJsonBody<LoginRequest>(req);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;

    if (!email || !password) {
      sendJson(res, 400, { error: "Email and password are required" });
      return;
    }

    const user = users.find(
      (candidate) => candidate.email.toLowerCase() === email && candidate.password === password,
    );

    if (!user) {
      sendJson(res, 401, { error: "Invalid credentials" });
      return;
    }

    const { token, exp } = createToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    sendJson(res, 200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      expiresAt: new Date(exp * 1000).toISOString(),
    });
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
  }
}
