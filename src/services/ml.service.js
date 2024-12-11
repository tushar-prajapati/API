import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

// Function to send images to the ML Model
const sendImagesToMLModel = async (image, images) => {
    try {
        const response = await axios.post(`${ML_MODEL_URL}/analyze`, {
            image, images // Pass image paths or base64-encoded strings as required by the ML model
        });

        // Parse and return the ML model's response
        return response.data;
    } catch (error) {
        console.error("Error communicating with the ML model:", error.message);
        throw new ApiError(500, "Failed to process images with the ML model.");
    }
};

export { sendImagesToMLModel };
