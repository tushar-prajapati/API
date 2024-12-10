import { Project } from "../models/project.models.js";
import { Segment } from "../models/segments.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from 
'fs'


const createProject = asyncHandler(async (req, res) => {
  const { title, description, segments } = req.body;

  if (!title || !segments || segments.length === 0) {
    throw new ApiError(400, "Project title and at least one segment are required.");
  }
  const existingProject = await Project.findOne({ title, owner: req.user._id });
    if (existingProject) {
        throw new ApiError(409, "A project with this title already exists.");
    }

  const project = await Project.create({
    title,
    description,
    owner: req.user._id,
  });

  const createdSegments = await Segment.insertMany(
    segments.map((name) => ({ name, project: project._id }))
  );

  project.segments = createdSegments.map((seg) => seg._id);
  await project.save();

  return res.status(201).json(
    new ApiResponse(201, project, "Project created successfully.")
  );
});

const getUserProjects = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const projects = await Project.find({ owner: userId }).populate("segments");

    if (!projects) {
        throw new ApiError(404, "No projects found for this user.");
    }

    return res.status(200).json(new ApiResponse(200, projects, "Projects retrieved successfully."));
});

const getSingleProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!projectId) {
        throw new ApiError(400, "Project ID is required.");
    }

    const project = await Project.findById(projectId).populate("segments");

    if (!project) {
        throw new ApiError(404, "Project not found.");
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to access this project.");
    }

    return res.status(200).json(
        new ApiResponse(200, project, "Project retrieved successfully.")
    );
});

const uploadThumbnail= asyncHandler(async(req,res)=>{
  const {projectId} = req.body;
  if (!projectId) {
    throw new ApiError(400, "Project ID is required.");
  }
  const project = await Project.findById(projectId);
  if (!project) {
      throw new ApiError(404, "Project not found.");
  }
  const file = req.file;
  if(!file){
    throw new ApiError(403, "Thumbnail not uploaded.")
  }
  const images = []
  const filePath = `./public/temp/${file.filename}`;
  const uploadedImage = await uploadOnCloudinary(filePath);
          images.push(uploadedImage.url);
          fs.unlinkSync(filePath);
          project.thumbnail = uploadedImage.url;
          await project.save({validateBeforeSave: false})
          const thumbnail = uploadedImage.url;
        
  res.status(201).json(new ApiResponse(201, "Thumnail uploaded successfully.", { thumbnail }));
  
})

export {
    createProject,
    getUserProjects,
    getSingleProject,
    uploadThumbnail
    
}

