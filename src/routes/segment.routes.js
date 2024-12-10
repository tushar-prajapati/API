import { Router } from "express";
import { createSegmentsForProject, getSegmentsForProject } from "../controllers/segment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createSegments").post(verifyJWT, createSegmentsForProject);
router.route("/getSegments/:projectId").get(verifyJWT, getSegmentsForProject);

export default router;
