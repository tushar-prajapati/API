import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        lowercase: true,
        unique : true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique : true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    },
    refreshToken:{
        type: String,
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }],
    isAdmin: {
        type: Boolean,
        default: false,
    },
    employees: [{type: String}],
    assignedSegments: [],
    master: String,
 
},{timestamps: true})

userSchema.pre("save", async function (next){
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 8)
    next()
    
} )

userSchema.methods.isPasswordCorrect = async function(password){
   return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id : this._id,
            username: this.username,
            fullName: this.fullName,
            email : this.email,
            isAdmin: this.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id : this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)