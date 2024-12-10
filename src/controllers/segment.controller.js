import { Segment } from "../models/segments.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.models.js";

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


export {
    createSegmentsForProject,
    getSegmentsForProject,
}