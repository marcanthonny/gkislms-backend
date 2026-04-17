import { createHmac, timingSafeEqual } from "node:crypto";
import type { AuthTokenPayload } from "../interfaces/auth";

const TOKEN_TTL_SECONDS = 60 * 60 * 8;

function getAuthSecret(): string {
  return process.env.AUTH_SECRET ?? "gkislms-dev-secret-change-me";
}

function toBase64Url(input: string): string {
  return Buffer.from(input, "utf8").toString("base64url");
}

function fromBase64Url(input: string): string {
  return Buffer.from(input, "base64url").toString("utf8");
}

function sign(data: string): string {
  return createHmac("sha256", getAuthSecret()).update(data).digest("base64url");
}

export function createToken(payload: Omit<AuthTokenPayload, "iat" | "exp">): { token: string; exp: number } {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + TOKEN_TTL_SECONDS;
  const fullPayload: AuthTokenPayload = { ...payload, iat, exp };
  const encodedPayload = toBase64Url(JSON.stringify(fullPayload));
  const signature = sign(encodedPayload);

  return {
    token: `${encodedPayload}.${signature}`,
    exp,
  };
}

export function verifyToken(token: string): AuthTokenPayload | null {
  const [encodedPayload, incomingSignature] = token.split(".");

  if (!encodedPayload || !incomingSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const incomingBuffer = Buffer.from(incomingSignature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (incomingBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!timingSafeEqual(incomingBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as AuthTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function getBearerToken(authorizationHeader: string | string[] | undefined): string | null {
  if (!authorizationHeader || Array.isArray(authorizationHeader)) {
    return null;
  }

  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length).trim() || null;
}
