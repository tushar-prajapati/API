import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    segments:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Segment"
    }],
    projectStatus: {
        type: String,
        enum: ['Active','Completed']
    },
    completeReport: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Segment"
    }],
    thumbnail: {
        type: String,
    },
    stretch: {
        type: Number
    },


},{timestamps: true})

projectSchema.plugin(mongooseAggregatePaginate)

export const Project = mongoose.model("Project", projectSchema)