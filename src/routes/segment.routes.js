import { Router } from "express";
import { createSegmentsForProject, getSegments, getSegmentsForProject, getSingleSegment, setSegmentInfo } from "../controllers/segment.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/createSegments").post(verifyJWT, createSegmentsForProject);
router.route("/getSegments/:projectId").get(verifyJWT, getSegmentsForProject);
router.route("/setSegmentInfo").post(verifyJWT, setSegmentInfo)
router.route("/getSegments").get(verifyJWT, getSegments)
router.route("/getSingleSegment").get(verifyJWT, getSingleSegment)
export default router;
