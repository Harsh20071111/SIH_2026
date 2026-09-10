import dns from "node:dns";
import "./env";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore if custom DNS servers cannot be set
}

const MONGODB_URI =
  process.env["MONGODB_URI"] ||
  "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";

async function seed() {
  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected");

  // Import models (after connection)
  const { User } = await import("../models/User");
  const { Case } = await import("../models/Case");
  const { SecureDocument } = await import("../models/Document");
  const { DocumentVersion } = await import("../models/DocumentVersion");
  const { Review } = await import("../models/Review");
  const { AuditLog } = await import("../models/AuditLog");
  const { SecurityEvent } = await import("../models/SecurityEvent");

  // Clear existing data
  console.log("🗑️  Clearing all existing data...");
  await Promise.all([
    User.deleteMany({}),
    Case.deleteMany({}),
    SecureDocument.deleteMany({}),
    DocumentVersion.deleteMany({}),
    Review.deleteMany({}),
    AuditLog.deleteMany({}),
    SecurityEvent.deleteMany({}),
  ]);

  // Seed single Admin user
  console.log("👤 Creating single Admin user: Harsh_2007...");
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("password123", salt);

  const admin = await User.create({
    email: "harsh_2007@securedocs.gov",
    name: "Harsh_2007",
    role: "Admin",
    department: "Administration",
    passwordHash,
    employeeId: "Harsh_2007",
    isActive: true,
  });
  console.log(`   ✅ Created Admin user: ${admin.name} (${admin.email})`);

  // Seed genesis audit log
  console.log("🔗 Creating initial genesis audit event...");
  const previousHash = "0000000000000000000000000000000000000000000000000000000000000000";
  const timestamp = new Date();
  const genesisData = {
    userId: "Harsh_2007",
    action: "SYSTEM_INITIALIZED",
    resourceType: "System",
    resourceId: "SYS-INIT",
    timestamp,
    ipAddress: "127.0.0.1",
    userAgent: "SecureDocs-Seed/1.0",
    metadata: { note: "Single admin initialized. No demo data." },
    previousHash,
  };

  const canonicalPayload = [
    genesisData.previousHash,
    genesisData.timestamp.toISOString(),
    genesisData.userId,
    genesisData.action,
    genesisData.resourceType,
    genesisData.resourceId,
    JSON.stringify(genesisData.metadata),
  ].join("|");

  const eventHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  await AuditLog.create({ ...genesisData, eventHash });
  console.log(`   ✅ Created genesis audit event (${eventHash.slice(0, 16)}...)`);

  console.log("\n🎉 Seed complete! Kept only 1 admin user with 0 demo cases/documents.");
  console.log("\n📋 Admin credentials:");
  console.log("   Identifier / Email: Harsh_2007 (or harsh_2007@securedocs.gov)");
  console.log("   Password:          password123");
  console.log("   Role:              Admin");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
