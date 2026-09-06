import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import documentsRouter from "./documents";
import auditRouter from "./audit";
import securityRouter from "./security";
import firRouter from "./fir";
import attachmentsRouter from "./attachments";
import reviewsRouter from "./reviews";
import usersRouter from "./users";
import { authenticateAppwriteUser } from "../middlewares/auth";

const router: IRouter = Router();

// Apply Appwrite user identification across all endpoints
router.use(authenticateAppwriteUser);

// Core APIs (Preserved)
router.use(healthRouter);
router.use("/cases", casesRouter);
router.use("/documents", documentsRouter);

// Integrated Governance & Operational Routes
router.use("/audit", auditRouter);
router.use("/security", securityRouter);
router.use("/fir", firRouter);
router.use("/attachments", attachmentsRouter);
router.use("/reviews", reviewsRouter);
router.use("/users", usersRouter);

export default router;
