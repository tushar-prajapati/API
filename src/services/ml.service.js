import axios from "axios";
import FormData from "form-data";
import { ApiError } from "../utils/ApiError.js";

import fs from "fs"
// Example: Buffer representing an image


const sendImagesToMLModel = async (file1, file2) => {

    try {
        // Create a FormData instance
        const formData = new FormData();
        
        // Append file streams to formData
        formData.append("file1", file1);
       
        
        // Optional filename
        formData.append("file2", file2); // Optional filename

        // Make the API call to the FastAPI server
        const response = await axios.post(`${process.env.ML_MODEL_URL}/predict`, formData, {
            headers: {
                'Content-Type':'multipart/form-data'
            },
        });

        // Return the parsed response
        return response.data;
    } catch (error) {
        console.error("Error communicating with the ML server:", error.message);

        // Rethrow the error for the calling function to handle
        throw new ApiError(500, "Failed to process images with the ML model.");
    }
};

export { sendImagesToMLModel };
