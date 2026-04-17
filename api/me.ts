import type { IncomingMessage, ServerResponse } from "node:http";
import { users } from "../src/data/users";
import { getBearerToken, verifyToken } from "../src/utils/auth";
import { sendJson } from "../src/utils/http";

export default function handler(req: IncomingMessage, res: ServerResponse): void {
  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const token = getBearerToken(req.headers.authorization);
  if (!token) {
    sendJson(res, 401, { error: "Missing bearer token" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    sendJson(res, 401, { error: "Invalid or expired token" });
    return;
  }

  const user = users.find((candidate) => candidate.id === payload.sub);
  if (!user) {
    sendJson(res, 401, { error: "User not found" });
    return;
  }

  sendJson(res, 200, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
}
