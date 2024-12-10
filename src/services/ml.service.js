import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

// Function to send images to the ML Model
const sendImagesToMLModel = async (images) => {
    try {
        // const { ML_MODEL_URL } = process.env;

        // Send HTTP POST request to the ML model endpoint
        const response = await axios.post(`${ML_MODEL_URL}/analyze`, {
            images, // Pass image paths or base64-encoded strings as required by the ML model
        });

        // Parse and return the ML model's response
        return response.data;
    } catch (error) {
        console.error("Error communicating with the ML model:", error.message);
        throw new ApiError(500, "Failed to process images with the ML model.");
    }
};

export { sendImagesToMLModel };
