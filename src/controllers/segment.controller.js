import { Segment } from "../models/segments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.models.js";
import { User } from "../models/user.models.js";

const createSegmentsForProject = asyncHandler(async (req, res) => {
    const { projectId, segments } = req.body;
    if (!projectId || !segments || segments.length === 0) {
        throw new ApiError(400, "Project ID and segments are required.");
    }

    const project = await Project.findById(projectId);
    if (!project) {
        throw new ApiError(404, "Project not found.");
    }

    const newSegments = await Segment.insertMany(
        segments.map(name => ({
            name,
            project: projectId,
        }))
    );

    project.segments.push(...newSegments.map(seg => seg._id));
    await project.save();

    return res.status(201).json(new ApiResponse(201, newSegments, "Segments created successfully."));
});

const getSegmentsForProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const segments = await Segment.find({ project: projectId });
    
    if (!segments || segments.length === 0) {
        throw new ApiError(404, "No segments found for this project.");
    }

    return res.status(200).json(new ApiResponse(200, segments, "Segments retrieved successfully."));
});

const setSegmentInfo = asyncHandler(async(req, res)=>{
    const {segmentId, length, startLatitude, startLongitude, endLatitude, endLongitude, userId } =  req.body;
    if(!segmentId || !length || !startLatitude || !startLongitude || !endLatitude || !endLongitude){
        throw new ApiError(403, "All values are not given.")
    }

    const updatedSegment = await Segment.findByIdAndUpdate(
        segmentId,
        {
            length,
            startLatitude,
            startLongitude,
            endLatitude,
            endLongitude,
            assignedTo: userId,
        },
        { new: true, runValidators: true } // Return the updated document and run validation
    );

    if (!updatedSegment) {
        throw new ApiError(404, "Segment not found.");
    }
    const user = await User.findById(userId);

    user.assignedSegments.push(segmentId)

    await user.save({validateBeforeSave: false});

    // Respond with the updated segment
    return res.status(200).json(
        new ApiResponse(200, updatedSegment, "Segment updated successfully.")
    );


    




});

const getSegments = asyncHandler(async(req,res)=>{
    const segments = req.user.assignedSegments;
    res.status(200).json(new ApiResponse(200, segments, "Segments fetch successfully"))
})

const getSingleSegment = asyncHandler(async(req,res)=>{
    const { segmentId } = req.body;
    console.log("Segment ID:", segmentId);

    const segment = await Segment.findById(segmentId);
    res.status(200).json(new ApiResponse(200, segment, "Segments fetched successfully"))
})




export {
    createSegmentsForProject,
    getSegmentsForProject,
    setSegmentInfo,
    getSegments,
    getSingleSegment,
}