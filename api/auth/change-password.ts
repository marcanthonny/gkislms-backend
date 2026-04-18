import type { IncomingMessage, ServerResponse } from "node:http";
import { findUserById, updateUserPassword } from "../../src/data/users";
import { getBearerToken, verifyToken } from "../../src/utils/auth";
import { sendJson } from "../../src/utils/http";
import { readJsonBody } from "../../src/utils/request";

interface ChangePasswordRequest {
  userId?: string;
  oldPassword?: string;
  newPassword?: string;
}

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
  if (!actor) {
    sendJson(res, 401, { error: "Invalid or expired token" });
    return;
  }

  try {
    const body = await readJsonBody<ChangePasswordRequest>(req);
    const newPassword = body?.newPassword ?? "";
    const oldPassword = body?.oldPassword ?? "";
    const targetUserId = body?.userId ?? actor.sub;

    if (!newPassword) {
      sendJson(res, 400, { error: "newPassword is required" });
      return;
    }

    if (newPassword.length < 6) {
      sendJson(res, 400, { error: "Password must be at least 6 characters" });
      return;
    }

    const targetUser = findUserById(targetUserId);
    if (!targetUser) {
      sendJson(res, 404, { error: "User not found" });
      return;
    }

    const isAdmin = actor.role === "Admin";
    const isSelf = actor.sub === targetUser.id;
    if (!isAdmin && !isSelf) {
      sendJson(res, 403, { error: "You can only change your own password" });
      return;
    }

    if (!isAdmin && targetUser.password !== oldPassword) {
      sendJson(res, 401, { error: "Old password is incorrect" });
      return;
    }

    updateUserPassword(targetUser.id, newPassword);
    sendJson(res, 200, { message: "Password updated successfully", userId: targetUser.id });
  } catch {
    sendJson(res, 400, { error: "Invalid JSON body" });
  }
}
