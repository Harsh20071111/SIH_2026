import { Router } from "express";
import mongoose from "mongoose";
import Document from "../models/Document.js";

const router = Router();

export const fallbackDocuments = [
  {
    _id: new mongoose.Types.ObjectId().toString(),
    caseId: "CASE-2026-001",
    fileName: "FIR_2026_001.pdf",
    documentType: "FIR",
    description: "Initial FIR report for case 001",
    uploadedBy: "Officer Raj Patel",
    status: "Approved",
    appwriteFileId: null,
    storagePath: null,
    sha256Hash: null,
    encryptionAlgorithm: null,
    uploadedAt: new Date("2026-09-02T10:00:00Z"),
    createdAt: new Date("2026-09-02T10:00:00Z"),
    updatedAt: new Date("2026-09-02T10:00:00Z"),
  },
  {
    _id: new mongoose.Types.ObjectId().toString(),
    caseId: "CASE-2026-001",
    fileName: "Evidence_Record_01.pdf",
    documentType: "Evidence Record",
    description: "Physical evidence ledger extract",
    uploadedBy: "Officer Amit Shah",
    status: "Pending",
    appwriteFileId: null,
    storagePath: null,
    sha256Hash: null,
    encryptionAlgorithm: null,
    uploadedAt: new Date("2026-09-03T11:30:00Z"),
    createdAt: new Date("2026-09-03T11:30:00Z"),
    updatedAt: new Date("2026-09-03T11:30:00Z"),
  },
];

const VALID_DOC_STATUSES = ["Pending", "Under Review", "Approved", "Rejected"];

function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

async function findDocumentById(id) {
  if (isDbConnected()) {
    if (mongoose.Types.ObjectId.isValid(id)) {
      return await Document.findById(id);
    }
    return null;
  }
  return fallbackDocuments.find((d) => d._id === id) || null;
}

// POST /api/documents - Create document metadata
router.post("/", async (req, res) => {
  try {
    const {
      caseId,
      fileName,
      documentType,
      description,
      uploadedBy,
      status,
      appwriteFileId,
      storagePath,
      sha256Hash,
      encryptionAlgorithm,
    } = req.body;

    if (!caseId || !fileName) {
      return res.status(400).json({
        success: false,
        message: "caseId and fileName are required fields",
      });
    }

    if (status && !VALID_DOC_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `${status} is not a valid document status`,
      });
    }

    const trimmedCaseId = String(caseId).trim();
    const trimmedFileName = String(fileName).trim();

    if (isDbConnected()) {
      const newDoc = new Document({
        caseId: trimmedCaseId,
        fileName: trimmedFileName,
        documentType: documentType || "General",
        description: description || "",
        uploadedBy: uploadedBy || null,
        status: status || "Pending",
        appwriteFileId: appwriteFileId || null,
        storagePath: storagePath || null,
        sha256Hash: sha256Hash || null,
        encryptionAlgorithm: encryptionAlgorithm || null,
        uploadedAt: new Date(),
      });

      const saved = await newDoc.save();

      return res.status(201).json({
        success: true,
        message: "Document created successfully",
        data: saved,
      });
    }

    const newDoc = {
      _id: new mongoose.Types.ObjectId().toString(),
      caseId: trimmedCaseId,
      fileName: trimmedFileName,
      documentType: documentType || "General",
      description: description || "",
      uploadedBy: uploadedBy || null,
      status: status || "Pending",
      appwriteFileId: appwriteFileId || null,
      storagePath: storagePath || null,
      sha256Hash: sha256Hash || null,
      encryptionAlgorithm: encryptionAlgorithm || null,
      uploadedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fallbackDocuments.unshift(newDoc);

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: newDoc,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// GET /api/documents - Return all documents (with filtering & search)
router.get("/", async (req, res) => {
  try {
    const { caseId, status, documentType, search } = req.query;

    if (isDbConnected()) {
      const filter = {};

      if (caseId) {
        filter.caseId = String(caseId).trim();
      }
      if (status) {
        filter.status = String(status).trim();
      }
      if (documentType) {
        filter.documentType = String(documentType).trim();
      }
      if (search) {
        const searchRegex = new RegExp(String(search).trim(), "i");
        filter.$or = [
          { fileName: searchRegex },
          { description: searchRegex },
          { documentType: searchRegex },
          { caseId: searchRegex },
        ];
      }

      const documents = await Document.find(filter).sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: documents,
      });
    }

    let list = [...fallbackDocuments];
    if (caseId) {
      list = list.filter((d) => d.caseId.toLowerCase() === String(caseId).trim().toLowerCase());
    }
    if (status) {
      list = list.filter((d) => d.status.toLowerCase() === String(status).trim().toLowerCase());
    }
    if (documentType) {
      list = list.filter(
        (d) => d.documentType.toLowerCase() === String(documentType).trim().toLowerCase()
      );
    }
    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (d) =>
          d.fileName.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          d.documentType.toLowerCase().includes(q) ||
          d.caseId.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// GET /api/documents/:id - Return one document
router.get("/:id", async (req, res) => {
  try {
    const doc = await findDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// PUT /api/documents/:id - Update document metadata/status
router.put("/:id", async (req, res) => {
  try {
    const doc = await findDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const { status } = req.body;
    if (status && !VALID_DOC_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `${status} is not a valid document status`,
      });
    }

    const allowedUpdates = [
      "fileName",
      "documentType",
      "description",
      "status",
      "appwriteFileId",
      "storagePath",
      "sha256Hash",
      "encryptionAlgorithm",
    ];

    if (isDbConnected() && typeof doc.save === "function") {
      for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
          doc[key] = req.body[key];
        }
      }

      const updated = await doc.save();

      return res.status(200).json({
        success: true,
        message: "Document updated successfully",
        data: updated,
      });
    }

    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        doc[key] = req.body[key];
      }
    }
    doc.updatedAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Document updated successfully",
      data: doc,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// DELETE /api/documents/:id - Delete document metadata
router.delete("/:id", async (req, res) => {
  try {
    const doc = await findDocumentById(req.params.id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (isDbConnected()) {
      await Document.deleteOne({ _id: doc._id });
    } else {
      const idx = fallbackDocuments.findIndex((d) => d._id === doc._id);
      if (idx >= 0) fallbackDocuments.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

export default router;
