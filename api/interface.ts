import type { IncomingMessage, ServerResponse } from "node:http";
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

  sendJson(res, 200, {
    service: "gkislms-backend",
    version: "1.0.0",
    endpoints: [
      {
        path: "/",
        method: "GET",
        response: "{ service: string; message: string; docs: string; health: string; }",
      },
      {
        path: "/auth/login",
        method: "POST",
        response: "{ token: string; user: User; expiresAt: string; }",
      },
      {
        path: "/me",
        method: "GET",
        response: "User (requires Authorization: Bearer <token>)",
      },
      {
        path: "/roles",
        method: "GET",
        response: "Role[]",
      },
      {
        path: "/health",
        method: "GET",
        response: "{ status: string; service: string; timestamp: string; }",
      },
    ],
    interfaces: {
      Role: {
        category: '"Teaching" | "Learning"',
        value: '"Student" | "Teacher" | "Admin"',
        label: "string",
        subtitle: "string",
        university: "string",
      },
      User: {
        id: "string",
        email: "string",
        name: "string",
        role: '"Student" | "Teacher" | "Admin"',
      },
    },
  });
}
