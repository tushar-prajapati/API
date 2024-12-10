import express from "express";
import multer from "multer";
import { getTimeline, runAnalysis1, runAnalysis2, uploadPhotos, uploadVideo } from "../controllers/analyse.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = express.Router();

const upload = multer({ dest: "./public/temp/" });

router.route("/upload/photos").post(verifyJWT, upload.array("photos", 50), uploadPhotos);

router.route("/upload/video").post(verifyJWT, upload.single("video"), uploadVideo);

router.route("/runAnalysis1/:segmentId").post(verifyJWT, upload.array("files"), runAnalysis1)

router.route("/runAnalysis2/:segmentId").post(verifyJWT, upload.array("files"), runAnalysis2)

router.route("/timeline/:segmentId").get(verifyJWT, getTimeline)


export default router;
