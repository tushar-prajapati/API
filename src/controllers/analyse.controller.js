import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Analyse } from "../models/analyse.models.js";
import { Segment } from "../models/segments.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { validateImages } from "../utils/verifyMetadata.js";
import { sendImagesToMLModel } from "../services/ml.service.js";
import { segmentResults } from "../utils/res.js";
// import { resizeImageFile } from "../utils/resize.js";


const uploadPhotos = asyncHandler(async (req, res) => {
    const { segmentId } = req.body;

    if (!segmentId) {
        throw new ApiError(400, "Segment ID is required.");
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) {
        throw new ApiError(404, "Segment not found.");
    }

    const files = req.files;

    if (!files || files.length === 0) {
        throw new ApiError(400, "No photos uploaded.");
    }

    const images = [];
    /*

    const requiredGPS = {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
    };

    if (isNaN(requiredGPS.latitude) || isNaN(requiredGPS.longitude)) {
        throw new ApiError(400, "Invalid GPS coordinates provided.");
    }

    // Validate images
    const imageBuffers = req.files.map((file) => file.buffer);
    const validationResults = validateImages(imageBuffers, requiredGPS);

    // Separate valid and invalid images
    const validImages = validationResults.filter((result) => result.success);
    const invalidImages = validationResults.filter((result) => !result.success);

    if (validImages.length === 0) {
        throw new ApiError(400, "All uploaded images failed validation.");
    }
        */

    for (const file of files) {
        
        const filePath = `./public/temp/${file.filename}`;

        // Upload image to Cloudinary
        const uploadedImage = await uploadOnCloudinary(filePath);
        images.push(uploadedImage.url);

        fs.unlinkSync(filePath); // Clean up uploaded file
    }

    // Save analysis in the database
    const analysis = await Analyse.create({
        segment: segmentId,
        images,
    });
    segment.analyse.push(analysis._id);
    await segment.save();


    res.status(201).json(new ApiResponse(201, "Photos uploaded and analysis initiated.", { analysis }));
});


const uploadVideo = asyncHandler(async (req, res) => {
    const { segmentId } = req.body;

    if (!segmentId) {
        throw new ApiError(400, "Segment ID is required.");
    }

    const segment = await Segment.findById(segmentId);
    if (!segment) {
        throw new ApiError(404, "Segment not found.");
    }

    const file = req.file;

    if (!file) {
        throw new ApiError(400, "No video uploaded.");
    }

    const filePath = `./public/temp/${file.filename}`;
    const videoFrames = [];

    const outputDir = `./public/temp/frames/`;
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    await new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .on("end", resolve)
            .on("error", reject)
            .output(`${outputDir}frame-%d.jpg`)
            .outputOptions("-vf fps=1")
            .run();
    });


    const frameFiles = fs.readdirSync(outputDir);
/* Validation
    const requiredGPS = {
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
    };

    if (isNaN(requiredGPS.latitude) || isNaN(requiredGPS.longitude)) {
        throw new ApiError(400, "Invalid GPS coordinates provided.");

    }

    // Validate images
    // const imageBuffers = req.files.map((file) => file.buffer);
    const validationResults = validateImages(frameFiles, requiredGPS);

    // Separate valid and invalid images
    const validImages = validationResults.filter((result) => result.success);
    const invalidImages = validationResults.filter((result) => !result.success);

    if (validImages.length === 0) {
        throw new ApiError(400, "Video frames failed validation!");
    }

*/


    for (const frameFile of frameFiles) {
        const framePath = `${outputDir}/${frameFile}`;
        const uploadedFrame = await uploadOnCloudinary(framePath);
        videoFrames.push(uploadedFrame.url);
        fs.unlinkSync(framePath); // Clean up local frame file
    }

    fs.unlinkSync(filePath); // Clean up uploaded file

    // Save analysis in the database
    const analysis = await Analyse.create({
        segment: segmentId,
        videoFrames,
    });

    res.status(201).json(new ApiResponse(201, "Video uploaded and analysis initiated.", { analysis }));
});

// const runAnalysis = asyncHandler(async (req, res) => {
//     const { segmentId } = req.params;
//     // const files = req.files; // Uploaded files

//     // if (!files || files.length === 0) {
//     //     throw new ApiError(400, "No files provided for analysis.");
//     // }

//     // Validate segment existence
//     const segment = await Segment.findById(segmentId);
//     if (!segment) {
//         throw new ApiError(404, "Segment not found.");
//     }
//     const files = 31

//     // Collect image paths
//     const imagePaths = files.map((file) => file.path);

//     // Send images to ML model for analysis
//     let mlResults;
//     try {
//         mlResults = segmentResults;
//         // mlResults = await sendImagesToMLModel(imagePaths, process.env.MODEL_URL);
//         } catch (err) {
//         throw new ApiError(500, "ML model analysis failed.");
//     }

//     // Generate a name for the analysis based on timestamp
//     const timestamp = new Date().toISOString();
//     const analysisName = `Analysis_${timestamp}`;

//     // Save the analysis results in the database
//     const analysis = await Analyse.create({
//         name: analysisName,
//         segment: segmentId,
//         images: imagePaths,
//         report: mlResults, // Parsed ML results
//         analyseStatus: "Processed",
//     });

//     return res.status(201).json(
//         new ApiResponse(201, analysis, "Analysis completed and saved.")
//     );
// });


// const runAnalysis = asyncHandler(async (req, res) => {
//     const { segmentId } = req.params;
//     const files = req.files; // Uploaded files

//     if (!files || files.length === 0) {
//         throw new ApiError(400, "No files provided for analysis.");
//     }

//     // Validate segment existence
//     const segment = await Segment.findById(segmentId);
//     if (!segment) {
//         throw new ApiError(404, "Segment not found.");
//     }

//     // Collect image paths
//     const file1 = files[0];
//     const file2 = files[1];

//     // Send images to ML model for analysis
//     let mlResults;
//     try {
//         mlResults = await sendImagesToMLModel(file1,file2);
//         } catch (err) {
//         throw new ApiError(500, "ML model analysis failed.");
//     }

//     // Generate a name for the analysis based on timestamp
//     const timestamp = new Date().toISOString();
//     const analysisName = `Analysis_${timestamp}`;

//     // Save the analysis results in the database
//     const analysis = await Analyse.create({
//         name: analysisName,
//         segment: segmentId,
//         images: imagePaths,
//         report: mlResults, // Parsed ML results
//         analyseStatus: "Processed",
//     });

//     return res.status(201).json(
//         new ApiResponse(201, analysis, "Analysis completed and saved.")
//     );
// });

const runAnalysis = asyncHandler(async (req, res) => {
    const { segmentId } = req.params;
   
    const files = req.files; // Uploaded files

    // console.log(files)


    // if (!files || files.length < 2) {
    //     throw new ApiError(400, "At least two files are required for analysis.");
    // }
    // Validate segment existence
    const segment = await Segment.findById(segmentId);
    if (!segment) {
        throw new ApiError(404, "Segment not found.");
    }

    

    
    let mlResults;
    try {
        
        // Send the streams to the ML model
        mlResults = await sendImagesToMLModel(files[0],files[1]);
    } catch (err) {
        console.error("Error during ML model analysis:", err.message);
       
    }

    // Generate a name for the analysis based on timestamp
    const timestamp = new Date().toISOString();
    const analysisName = `Analysis_${timestamp}`;

    // Save the analysis results in the database
    const analysis = await Analyse.create({
        name: analysisName,
        segment: segmentId,
        report: mlResults, // Parsed ML results
        analyseStatus: "Processed",
    });

    return res.status(201).json(
        new ApiResponse(201, mlResults, "Analysis completed and saved.")
    );
});


const recentAnalysis = asyncHandler(async(req,res)=>{
    const {segmentId} = req.body;
    const segment = await Segment.findById(segmentId)

    const recent= segment.analyse[-1]
    res.status(200, recent.images, "Recent Images Fetched Successfully" )

})




const getTimeline = asyncHandler(async (req, res) => {
    const { segmentId } = req.params;
    const segment = await Segment.findById(segmentId);
    if (!segment) {
        throw new ApiError(404, "Segment not found.");
    }
    
    
    const analyses = await Analyse.find({ segment: segmentId });
    console.log(analyses)
    // if (!analyses || analyses.length === 0) {
    //     throw new ApiError(404, "No analyses found for this segment.");
    // }

    return res.status(200).json(new ApiResponse(200, analyses, "Timeline fetched successfully."));
});

const getSingleAnalyse = asyncHandler(async(req,res)=>{
    const { analyseId } = req.body;
    console.log("Segment ID:", analyseId);

    const analyse = await Analyse.findById(analyseId);
    res.status(200).json(new ApiResponse(200, analyse, "Segments fetched successfully"))
})

export {uploadPhotos, uploadVideo, runAnalysis, getTimeline, getSingleAnalyse, recentAnalysis}
