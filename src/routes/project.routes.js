import { Router } from "express";
import { createProject, getUserProjects, getSingleProject, uploadThumbnail } from "../controllers/project.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();

router.route("/createProject").post(verifyJWT, createProject);
router.get("/getProjects", verifyJWT, getUserProjects);
router.get("/singleProject/:projectId", verifyJWT, getSingleProject);
router.route("/upload/thumbnail").post(verifyJWT, upload.single("thumbnail"), uploadThumbnail)


export default router;
