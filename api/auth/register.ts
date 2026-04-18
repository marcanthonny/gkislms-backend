import type { IncomingMessage, ServerResponse } from "node:http";
import { createUser, findUserByEmail, sanitizeUser } from "../../src/data/users";
import type { RoleValue } from "../../src/interfaces/role";
import { getBearerToken, verifyToken } from "../../src/utils/auth";
import { sendJson } from "../../src/utils/http";
import { readJsonBody } from "../../src/utils/request";

interface RegisterRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: RoleValue;
}

const ALLOWED_ROLES: RoleValue[] = ["Student", "Teacher", "Admin"];

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    sendJson(res, 401, { error: "Missing bearer token" });
    return;
  }

  const actor = verifyToken(token);
  if (!actor || actor.role !== "Admin") {
    sendJson(res, 403, { error: "Admin token required" });
    return;
  }

  try {
    const body = await readJsonBody<RegisterRequest>(req);
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password ?? "";
    const name = body?.name?.trim() ?? "";
    const role = body?.role;

    if (!email || !password || !name || !role) {
      sendJson(res, 400, { error: "email, password, name, and role are required" });
      return;
    }

    if (!ALLOWED_ROLES.includes(role)) {
      sendJson(res, 400, { error: "Invalid role" });
      return;
    }

    if (password.length < 6) {
      sendJson(res, 400, { error: "Password must be at least 6 characters" });
      return;
    }

    if (findUserByEmail(email)) {
      sendJson(res, 409, { error: "Email already exists" });
      return;
    }

    const user = createUser({ email, password, name, role });
    sendJson(res, 201, sanitizeUser(user));
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
  }
}
