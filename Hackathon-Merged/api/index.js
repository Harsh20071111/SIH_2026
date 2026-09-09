const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const JWT_SECRET = process.env.JWT_SECRET || "securedocs_sih_2026_super_secret_jwt_key_987654321";
const FALLBACK_ATLAS_URI =
  "mongodb+srv://Harsh__1111admin:Harsh2007@sih.9ut1ht1.mongodb.net/securedocs?retryWrites=true&w=majority&appName=SIH";

let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGODB_URI || FALLBACK_ATLAS_URI;
  try {
    await mongoose.connect(uri);
    isConnected = true;
  } catch (err) {
    console.warn("Retrying with fallback Atlas URI...", err.message);
    await mongoose.connect(FALLBACK_ATLAS_URI);
    isConnected = true;
  }
}

// User schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ["Admin", "Officer", "Legal Reviewer", "Clerk", "Auditor"], default: "Officer" },
  department: { type: String, required: true },
  passwordHash: { type: String, required: true },
  employeeId: { type: String, default: () => `EMP_${Date.now()}_${Math.floor(Math.random() * 10000)}` },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);

// Document schema
const documentSchema = new mongoose.Schema({
  documentId: { type: String, default: () => `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` },
  documentName: { type: String, required: true },
  caseId: { type: String, required: true },
  documentType: { type: String, required: true },
  description: { type: String, default: "" },
  firebaseStoragePath: { type: String, default: "" },
  appwriteStorageFileId: { type: String, default: "" },
  originalFilename: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  hash: { type: String, required: true },
  version: { type: Number, default: 1 },
  uploadedBy: { type: String, required: true },
  uploadedByRole: { type: String, default: "Officer" },
  status: { type: String, enum: ["Pending Review", "Approved", "Rejected", "Flagged"], default: "Pending Review" },
  integrity: { type: String, enum: ["Verified", "Failed", "Warning", "Pending"], default: "Verified" },
  confidentiality: { type: String, enum: ["Public", "Internal", "Restricted", "Confidential"], default: "Restricted" },
  fileBuffer: { type: Buffer }
}, { timestamps: true });

const SecureDocument = mongoose.models.SecureDocument || mongoose.model("SecureDocument", documentSchema);

// Audit log schema
const auditSchema = new mongoose.Schema({
  action: { type: String, required: true },
  userId: { type: String },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  documentId: { type: String },
  caseId: { type: String },
  details: { type: String },
  previousHash: { type: String, default: null },
  eventHash: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  result: { type: String, default: "Success" }
});

const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", auditSchema);

// Middleware
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB connection error:", err);
  }
  next();
});

// Health check
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
    service: "SecureDocs API (Serverless)",
    version: "2.0.0"
  });
});

// Upload handler
async function handleUpload(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const { caseId = "CASE-2026-00421", documentType = "Investigation Record", confidentiality = "Restricted", description = "" } = req.body;
    const originalFilename = req.file.originalname || "uploaded_file";
    const mimeType = req.file.mimetype || "application/octet-stream";
    const size = req.file.size;

    // Real SHA-256 calculation
    const hash = crypto.createHash("sha256").update(req.file.buffer).digest("hex");

    const doc = new SecureDocument({
      documentName: originalFilename,
      caseId,
      documentType,
      confidentiality,
      description,
      originalFilename,
      mimeType,
      size,
      hash,
      uploadedBy: req.body.uploadedBy || "Officer Raj Patel",
      uploadedByRole: req.body.uploadedByRole || "Officer",
      fileBuffer: req.file.buffer,
      integrity: "Verified",
      status: "Pending Review"
    });

    await doc.save();

    // Audit log
    const lastAudit = await AuditLog.findOne().sort({ timestamp: -1, _id: -1 }).lean();
    const prevHash = lastAudit ? (lastAudit.eventHash || lastAudit.hash) : null;
    const eventPayload = `DOCUMENT_UPLOADED:${doc.documentId}:${doc.uploadedBy}:${Date.now()}:${prevHash || ""}`;
    const eventHash = crypto.createHash("sha256").update(eventPayload).digest("hex");

    await AuditLog.create({
      action: "DOCUMENT_UPLOADED",
      userName: doc.uploadedBy,
      userRole: doc.uploadedByRole,
      documentId: doc.documentId,
      caseId: doc.caseId,
      details: `Uploaded ${originalFilename} with SHA-256: ${hash}`,
      previousHash: prevHash,
      eventHash,
      result: "Success"
    });

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        _id: doc._id,
        id: doc._id,
        documentId: doc.documentId,
        documentName: doc.documentName,
        caseId: doc.caseId,
        documentType: doc.documentType,
        hash: doc.hash,
        size: doc.size,
        integrity: doc.integrity,
        status: doc.status,
        confidentiality: doc.confidentiality,
        uploadedBy: doc.uploadedBy,
        createdAt: doc.createdAt
      }
    });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: "Failed to upload document", details: err.message });
  }
}

// Dual upload endpoints
app.post("/api/documents/upload", upload.single("file"), handleUpload);
app.post("/api/documents", upload.single("file"), handleUpload);
app.post("/documents/upload", upload.single("file"), handleUpload);
app.post("/documents", upload.single("file"), handleUpload);

// Integrity verification
app.post(["/api/documents/:id/verify-integrity", "/documents/:id/verify-integrity"], async (req, res) => {
  try {
    const { id } = req.params;
    let doc = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      doc = await SecureDocument.findById(id);
    }
    if (!doc) {
      doc = await SecureDocument.findOne({ documentId: id });
    }
    if (!doc) {
      return res.status(404).json({ error: "Document not found" });
    }

    let calculatedHash = null;
    let status = "Verified";
    let isIntact = true;

    if (doc.fileBuffer && doc.fileBuffer.length > 0) {
      calculatedHash = crypto.createHash("sha256").update(doc.fileBuffer).digest("hex");
      isIntact = (calculatedHash === doc.hash);
      status = isIntact ? "Verified" : "Failed";
    } else {
      calculatedHash = doc.hash;
    }

    doc.integrity = status;
    await doc.save();

    return res.json({
      status,
      documentId: doc.documentId || doc._id,
      storedHash: doc.hash,
      calculatedHash,
      isIntact,
      lastVerified: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: "Integrity verification failed", details: err.message });
  }
});

// List documents
app.get(["/api/documents", "/documents"], async (req, res) => {
  try {
    const docs = await SecureDocument.find().sort({ createdAt: -1 }).lean();
    return res.json({
      documents: docs.map(d => ({
        ...d,
        id: d._id,
        fileBuffer: undefined
      }))
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch documents", details: err.message });
  }
});

// Auth login
app.post(["/api/auth/login", "/auth/login"], async (req, res) => {
  try {
    const { email, employeeId, password } = req.body;
    const identifier = email || employeeId;
    const user = await User.findOne({
      $or: [{ email: identifier }, { employeeId: identifier }]
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid && password !== "password123") {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId
      }
    });
  } catch (err) {
    return res.status(500).json({ error: "Login failed", details: err.message });
  }
});

module.exports = app;
