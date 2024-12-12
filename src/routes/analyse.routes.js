import express from "express";
import multer from "multer";
import { getTimeline, runAnalysis, uploadPhotos, uploadVideo } from "../controllers/analyse.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSingleAnalyse } from "../controllers/analyse.controller.js";


const router = express.Router();

const upload = multer({ dest: "./public/temp/" });


router.route("/upload/photos").post(verifyJWT, upload.array("photos", 50), uploadPhotos);

router.route("/upload/video").post(verifyJWT, upload.single("video"), uploadVideo);

router.route("/runAnalysis/:segmentId").post(verifyJWT, upload.array("files",2), runAnalysis)

router.route("/timeline/:segmentId").get(verifyJWT, getTimeline)

router.route("/getSingleAnalyse").get(verifyJWT, getSingleAnalyse)


export default router;
