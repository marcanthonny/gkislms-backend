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
    message: "API is running",
    docs: "/interface",
    health: "/health",
  });
}
