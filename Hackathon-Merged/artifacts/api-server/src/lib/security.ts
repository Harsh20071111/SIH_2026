import { logger } from "./logger";

// We import the model lazily to avoid circular dependencies
let SecurityEventModel: any = null;

async function getSecurityEventModel() {
  if (!SecurityEventModel) {
    SecurityEventModel = (await import("../models/SecurityEvent")).SecurityEvent;
  }
  return SecurityEventModel;
}

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

/**
 * Rule-based risk scoring engine.
 * Each rule adds its weight to the score if the condition is met.
 * Final score is capped at 100.
 */
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
      input.action.toLowerCase().includes("restricted"),
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

/**
 * Record a security event with automatic risk scoring.
 */
export async function createSecurityEvent(
  input: SecurityEventInput
): Promise<void> {
  try {
    const SecEventDoc = await getSecurityEventModel();
    const { score, level, triggeredRules } = computeRiskScore(input);

    await SecEventDoc.create({
      ...input,
      riskScore: score,
      riskLevel: level,
      triggeredRules,
      status: score >= 50 ? "Open" : "Monitoring",
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error({ err, type: input.type }, "Failed to create security event");
  }
}

/**
 * Get risk summary statistics from the security events collection.
 */
export async function getRiskSummary(): Promise<{
  totalEvents: number;
  openEvents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  averageRiskScore: number;
}> {
  const SecEventDoc = await getSecurityEventModel();

  const [stats] = await SecEventDoc.aggregate([
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
}
