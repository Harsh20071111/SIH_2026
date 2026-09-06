import mongoose from "mongoose";
import { logger } from "./logger";
import { SecurityEvent } from "../models/SecurityEvent";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface SecurityEventInput {
  type: string;
  userId?: string;
  userName?: string;
  action: string;
  caseId?: string;
  documentId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

interface RiskRule {
  name: string;
  weight: number;
  check: (input: SecurityEventInput) => boolean;
}

const riskRules: RiskRule[] = [
  {
    name: "Failed login attempt",
    weight: 15,
    check: (input) => input.type === "LOGIN_FAILED",
  },
  {
    name: "Unauthorized access attempt",
    weight: 30,
    check: (input) =>
      input.action.toLowerCase().includes("unauthorized") ||
      input.action.toLowerCase().includes("restricted") ||
      input.action.toLowerCase().includes("denied"),
  },
  {
    name: "Unusual download volume",
    weight: 25,
    check: (input) =>
      input.action.toLowerCase().includes("bulk") ||
      input.action.toLowerCase().includes("excessive"),
  },
  {
    name: "After-hours access",
    weight: 10,
    check: () => {
      const hour = new Date().getHours();
      return hour < 6 || hour > 22;
    },
  },
  {
    name: "Integrity issue detected",
    weight: 40,
    check: (input) =>
      input.type === "INTEGRITY_ISSUE" ||
      input.action.toLowerCase().includes("integrity"),
  },
  {
    name: "Unknown or new device",
    weight: 15,
    check: (input) =>
      !input.userAgent || input.userAgent.toLowerCase().includes("unknown"),
  },
];

function computeRiskScore(input: SecurityEventInput): {
  score: number;
  level: RiskLevel;
  triggeredRules: string[];
} {
  let score = 0;
  const triggeredRules: string[] = [];

  for (const rule of riskRules) {
    if (rule.check(input)) {
      score += rule.weight;
      triggeredRules.push(rule.name);
    }
  }

  score = Math.min(score, 100);

  let level: RiskLevel;
  if (score >= 80) level = "CRITICAL";
  else if (score >= 50) level = "HIGH";
  else if (score >= 25) level = "MEDIUM";
  else level = "LOW";

  return { score, level, triggeredRules };
}

export const inMemorySecurityEvents: Array<{
  _id: string;
  type: string;
  userId?: string;
  userName?: string;
  action: string;
  caseId?: string;
  documentId?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  triggeredRules: string[];
  status: "Open" | "Monitoring" | "Resolved";
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  timestamp: Date;
}> = [
  {
    _id: "sec_event_001",
    type: "LOGIN_FAILED",
    userName: "Unknown Analyst",
    action: "Failed authentication attempt",
    riskScore: 15,
    riskLevel: "LOW",
    triggeredRules: ["Failed login attempt"],
    status: "Monitoring",
    ipAddress: "192.168.1.45",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    timestamp: new Date("2026-09-02T14:30:00Z"),
  },
  {
    _id: "sec_event_002",
    type: "UNAUTHORIZED_ACCESS",
    userName: "External Client",
    action: "Unauthorized case access attempt",
    caseId: "CASE-2026-001",
    riskScore: 65,
    riskLevel: "HIGH",
    triggeredRules: ["Unauthorized access attempt", "After-hours access"],
    status: "Open",
    ipAddress: "103.21.244.0",
    userAgent: "Unknown Script/1.0",
    timestamp: new Date("2026-09-03T23:15:00Z"),
  },
];

export async function createSecurityEvent(
  input: SecurityEventInput
): Promise<void> {
  try {
    const { score, level, triggeredRules } = computeRiskScore(input);

    const eventRecord = {
      ...input,
      riskScore: score,
      riskLevel: level,
      triggeredRules,
      status: (score >= 50 ? "Open" : "Monitoring") as "Open" | "Monitoring",
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      await SecurityEvent.create(eventRecord);
    } else {
      inMemorySecurityEvents.unshift({
        _id: "sec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        ...eventRecord,
      });
    }
  } catch (err) {
    logger.error({ err, type: input.type }, "Failed to create security event");
  }
}

export async function getRiskSummary(): Promise<{
  totalEvents: number;
  openEvents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageRiskScore: number;
}> {
  try {
    if (mongoose.connection.readyState !== 1) {
      const totalEvents = inMemorySecurityEvents.length;
      const openEvents = inMemorySecurityEvents.filter((e) => e.status === "Open").length;
      const criticalCount = inMemorySecurityEvents.filter((e) => e.riskLevel === "CRITICAL").length;
      const highCount = inMemorySecurityEvents.filter((e) => e.riskLevel === "HIGH").length;
      const mediumCount = inMemorySecurityEvents.filter((e) => e.riskLevel === "MEDIUM").length;
      const lowCount = inMemorySecurityEvents.filter((e) => e.riskLevel === "LOW").length;
      const sumScore = inMemorySecurityEvents.reduce((acc, e) => acc + (e.riskScore || 0), 0);
      const averageRiskScore = totalEvents > 0 ? Math.round(sumScore / totalEvents) : 0;

      return {
        totalEvents,
        openEvents,
        criticalCount,
        highCount,
        mediumCount,
        lowCount,
        averageRiskScore,
      };
    }

    const [stats] = await SecurityEvent.aggregate([
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          openEvents: {
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] },
          },
          criticalCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "CRITICAL"] }, 1, 0] },
          },
          highCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "HIGH"] }, 1, 0] },
          },
          mediumCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "MEDIUM"] }, 1, 0] },
          },
          lowCount: {
            $sum: { $cond: [{ $eq: ["$riskLevel", "LOW"] }, 1, 0] },
          },
          averageRiskScore: { $avg: "$riskScore" },
        },
      },
    ]);

    return (
      stats ?? {
        totalEvents: 0,
        openEvents: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        averageRiskScore: 0,
      }
    );
  } catch (err) {
    logger.error({ err }, "Error computing risk summary");
    return {
      totalEvents: 0,
      openEvents: 0,
      criticalCount: 0,
      highCount: 0,
      mediumCount: 0,
      lowCount: 0,
      averageRiskScore: 0,
    };
  }
}
