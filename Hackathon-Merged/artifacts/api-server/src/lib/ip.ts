import type { Request } from "express";

/**
 * Extracts the user's real client IP address from the request,
 * taking into account reverse proxies, Cloudflare, Render, and Nginx.
 */
export function getClientIp(req: Request): string {
  let ip = "";

  // 1. Cloudflare header
  const cfIp = req.headers["cf-connecting-ip"];
  if (typeof cfIp === "string" && cfIp.trim()) {
    ip = cfIp.trim();
  }

  // 2. X-Forwarded-For header (first IP is the real client)
  if (!ip) {
    const forwarded = req.headers["x-forwarded-for"];
    if (typeof forwarded === "string" && forwarded.trim()) {
      ip = forwarded.split(",")[0].trim();
    } else if (Array.isArray(forwarded) && forwarded.length > 0) {
      ip = forwarded[0].trim();
    }
  }

  // 3. X-Real-IP header
  if (!ip) {
    const realIp = req.headers["x-real-ip"];
    if (typeof realIp === "string" && realIp.trim()) {
      ip = realIp.trim();
    }
  }

  // 4. Express req.ip (when trust proxy is enabled) or socket remoteAddress
  if (!ip) {
    ip = req.ip || req.socket?.remoteAddress || "";
  }

  // Clean IPv6-mapped IPv4 prefix (::ffff:192.168.1.1 -> 192.168.1.1)
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
}
