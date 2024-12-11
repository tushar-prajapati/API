import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    },
    name: {
        type: String,
        required: true,
    },
    analyse:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Analyse"
    }],
    segmentReport:{type: Object},
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    length: {
        type: Number,
    },
    startLatitude: {
        type: Number,
    },
    startLongitude: {
        type: Number,
    },
    endLatitude: {
        type: Number,
    },
    endLongitude: {
        type: Number,
    }
},{timestamps:true})

export const Segment = mongoose.model("Segment", segmentSchema);