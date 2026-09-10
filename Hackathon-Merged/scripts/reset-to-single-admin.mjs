import dns from "node:dns";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore DNS override errors
}

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log("Connected successfully to:", mongoose.connection.name);

  const db = mongoose.connection.db;

  const collections = await db.listCollections().toArray();
  console.log("Existing collections:", collections.map(c => c.name).join(", "));

  // Collections to wipe completely
  const collectionsToClear = [
    "cases",
    "documents",
    "securedocuments",
    "documentversions",
    "reviews",
    "securityevents",
    "auditlogs",
    "firs",
    "attachments",
    "users"
  ];

  for (const colName of collectionsToClear) {
    try {
      const col = db.collection(colName);
      const count = await col.countDocuments();
      const res = await col.deleteMany({});
      console.log(`Cleared ${res.deletedCount} of ${count} records in '${colName}'`);
    } catch (err) {
      console.log(`Skipped/error on '${colName}':`, err.message);
    }
  }

  // Create single Admin: Harsh_2007
  console.log("Creating single Admin user: Harsh_2007...");
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash("password123", salt);

  const adminUser = {
    email: "harsh_2007@securedocs.gov",
    name: "Harsh_2007",
    role: "Admin",
    department: "Administration",
    passwordHash,
    employeeId: "Harsh_2007",
    isActive: true,
    lastLogin: null,
    assignedCases: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const usersCol = db.collection("users");
  const insertRes = await usersCol.insertOne(adminUser);
  console.log("Admin user created with _id:", insertRes.insertedId);

  // Initial genesis audit log for tamper-evident chain
  const auditCol = db.collection("auditlogs");
  const genesisData = {
    userId: "Harsh_2007",
    action: "SYSTEM_INITIALIZED",
    resourceType: "System",
    resourceId: "SYS-INIT",
    timestamp: new Date(),
    ipAddress: "127.0.0.1",
    userAgent: "SecureDocs-System-Reset/1.0",
    metadata: { note: "All demo data removed. Single admin initialized." },
    previousHash: "0000000000000000000000000000000000000000000000000000000000000000"
  };

  const canonicalPayload = [
    genesisData.previousHash,
    genesisData.timestamp.toISOString(),
    genesisData.userId,
    genesisData.action,
    genesisData.resourceType,
    genesisData.resourceId,
    JSON.stringify(genesisData.metadata)
  ].join("|");

  genesisData.eventHash = crypto.createHash("sha256").update(canonicalPayload).digest("hex");
  await auditCol.insertOne(genesisData);
  console.log("Genesis audit log created with eventHash:", genesisData.eventHash);

  const remainingUsers = await usersCol.find({}).toArray();
  console.log("\nCurrent Users in DB:", remainingUsers.map(u => ({
    name: u.name,
    email: u.email,
    role: u.role,
    employeeId: u.employeeId
  })));

  const remainingCases = await db.collection("cases").countDocuments();
  const remainingDocs = await db.collection("documents").countDocuments();
  console.log(`Remaining Cases: ${remainingCases}, Remaining Documents: ${remainingDocs}`);

  await mongoose.disconnect();
  console.log("Done!");
}

main().catch(err => {
  console.error("Failed:", err);
  process.exit(1);
});
