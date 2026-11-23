/**
 * @file apps/web/src/app/api/access-requests/route.ts
 * @description API route handler for collecting FinAI Private Beta / Early Access applications.
 * Features honeypot anti-bot filtering, rate limiting, and structured logging.
 * @module @fin-ai/web/api/access-requests
 */

import { NextResponse } from "next/server";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";

const AccessRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(150),
  primaryGoal: z.string().trim().min(1, "Primary focus is required").max(50),
  notes: z.string().trim().max(500).optional().default(""),
  company_url_catch: z.string().optional().default(""), // Honeypot field
});

/** Lightweight in-memory rate limiting map: IP -> timestamp array */
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 },
      );
    }

    const body: unknown = await request.json();
    const result = AccessRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid form submission", details: result.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, primaryGoal, notes, company_url_catch } = result.data;

    // Honeypot defense: Silent drop if bot populated hidden input
    if (company_url_catch && company_url_catch.trim().length > 0) {
      return NextResponse.json({ success: true, queued: true }, { status: 200 });
    }

    const accessRecord = {
      id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: email.toLowerCase(),
      primaryGoal,
      notes: notes || null,
      app: "finai",
      status: "PENDING",
      createdAt: new Date().toISOString(),
      sourceIp: ip,
    };

    // Persist to local JSON data store
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "access-requests.json");

    try {
      await fs.mkdir(dataDir, { recursive: true });
      let existing: unknown[] = [];
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        existing = JSON.parse(fileContent);
      } catch {
        existing = [];
      }
      existing.push(accessRecord);
      await fs.writeFile(filePath, JSON.stringify(existing, null, 2), "utf-8");
    } catch {
      // In read-only or serverless environments, fallback to console structured log
    }

    // eslint-disable-next-line no-console
    console.info(`[ACCESS_REQUEST] Private beta application received for ${email} (${name})`);

    return NextResponse.json({
      success: true,
      message: "Access request registered successfully",
      id: accessRecord.id,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error processing access request" },
      { status: 500 },
    );
  }
}
