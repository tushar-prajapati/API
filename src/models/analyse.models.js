import mongoose from "mongoose";

const analyseSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
    },
    images: [{
        type: String,
    }],
    videoFrames: [{
        type: String,
    }],
    report: {type: Object},
    analyseStatus: {
        type: String,
        enum: ['Processed', 'Unprocessed', 'Error']
    },
    segment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Segment"
    }

},{timestamps:true})

export const Analyse = mongoose.model("Analyse", analyseSchema)

