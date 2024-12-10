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
    segmentReport:{type: Object,}
},{timestamps:true})

export const Segment = mongoose.model("Segment", segmentSchema);