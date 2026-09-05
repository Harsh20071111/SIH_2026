import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import casesRouter from "./cases";
import documentsRouter from "./documents";
import reviewsRouter from "./reviews";
import auditRouter from "./audit";
import securityRouter from "./security";
import dashboardRouter from "./dashboard";
import firRouter from "./fir";
import attachmentsRouter from "./attachments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(casesRouter);
router.use(documentsRouter);
router.use(reviewsRouter);
router.use(auditRouter);
router.use(securityRouter);
router.use(dashboardRouter);
router.use("/fir", firRouter);
router.use("/attachments", attachmentsRouter);

export default router;
