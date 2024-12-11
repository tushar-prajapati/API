import exifParser from "exif-parser";
import { ApiError } from "./ApiError.js";
/**
 * Validate an image's EXIF metadata with a 5% error margin for GPS coordinates.
 * @param {Buffer} imageBuffer - The image file buffer.
 * @param {Object} requiredGPS - The required GPS coordinates { latitude, longitude }.
 * @returns {Boolean} - True if valid, throws an error if invalid.
 */
const validateSingleImage = (imageBuffer, requiredGPS) => {
    const parser = exifParser.create(imageBuffer);
    const exifData = parser.parse();
    if (!exifData || !exifData.tags) {
        throw new ApiError(400, "No EXIF metadata found.");
    }
    const { GPSLatitude, GPSLongitude, ModifyDate } = exifData.tags;
    // Ensure requiredGPS is provided
    if (!requiredGPS || requiredGPS.latitude == null || requiredGPS.longitude == null) {
        throw new ApiError(400, "Required GPS coordinates are missing.");
    }
    // Calculate acceptable GPS range with 5% error margin
    const latitudeError = requiredGPS.latitude * 0.05;
    const longitudeError = requiredGPS.longitude * 0.05;
    const minLatitude = requiredGPS.latitude - latitudeError;
    const maxLatitude = requiredGPS.latitude + latitudeError;
    const minLongitude = requiredGPS.longitude - longitudeError;
    const maxLongitude = requiredGPS.longitude + longitudeError;
    // Validate GPS coordinates
    if (
        !GPSLatitude ||
        !GPSLongitude ||
        GPSLatitude < minLatitude ||
        GPSLatitude > maxLatitude ||
        GPSLongitude < minLongitude ||
        GPSLongitude > maxLongitude
    ) {
        throw new ApiError(400, "Invalid GPS coordinates (out of range).");
    }
    // Check if the image was modified
    const now = new Date();
    const modifiedDate = new Date(ModifyDate * 1000); // EXIF ModifyDate is in seconds
    if (now - modifiedDate < 0) {
        throw new ApiError(400, "Image shows signs of being modified.");
    }
    return true;
};
/**
 * Validate multiple images' EXIF metadata.
 * @param {Array<Buffer>} imageBuffers - Array of image file buffers.
 * @param {Object} requiredGPS - The required GPS coordinates { latitude, longitude }.
 * @returns {Array<Object>} - Array of validation results for each image.
 */
const validateImages = (imageBuffers, requiredGPS) => {
    return imageBuffers.map((buffer) => {
        try {
            validateSingleImage(buffer, requiredGPS);
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
};
export {validateImages, validateSingleImage}