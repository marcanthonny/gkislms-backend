import type { IncomingMessage, ServerResponse } from "node:http";
import { roles } from "../src/data/roles";
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

  sendJson(res, 200, roles);
}
