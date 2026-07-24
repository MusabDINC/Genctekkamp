import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import statsRouter from "./stats";
import projectsRouter from "./projects";
import studentRouter from "./student";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(statsRouter);
router.use(projectsRouter);
router.use(studentRouter);
router.use(adminRouter);

export default router;
