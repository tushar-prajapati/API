import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens  = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken  = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false});
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and refresh Tokens")
    }
}


// const registerUser = asyncHandler(async(req,res)=>{

//    const {fullName, email, username, password, isAdmin, masterId} = req.body;
//    console.log(fullName,email,username,password,isAdmin)

//     if(!fullName || !email || !password || !username)
//     {
//         throw new ApiError(400, "All fields are required.")
//     }
//     const existedUser = await User.findOne({
//         $or: [{ username }, { email }]
//     })

//     if (existedUser) {
//         throw new ApiError(409, "User with email or username already exists")
//     }

//     if(!isAdmin){
//         // const masterId = req.body;
//         const user = await User.create({
//             fullName,
//             email,
//             password,
//             username: username.toLowerCase(),
//             isAdmin: false,
//             master: masterId,
//         });

//         if(!user){
//             throw new ApiError(403, "User not created")
//         }
//         const masterPerson = await User.findById(masterId).select("-password");
//         await masterPerson.employees.push(user._id);

//         await masterPerson.save({validateBeforeSave: false})
//         if(!masterPerson){
//             throw new ApiError(401, "No Admin found")
//         }
//         return res
//         .status(200)
//         .json(new ApiResponse(200, "Employee Registered Successfully"))
//     }
    
//     const user = await User.create({
//         fullName,
//         email, 
//         password,
//         username: username.toLowerCase(),
//         isAdmin: true,
//     })
//     const createdUser = await User.findById(user._id).select(
//         "-password -refreshToken"
//     );
//     if(!createdUser){
//         throw new ApiError(501,"Something went wrong while registering the user")
//     }  
//     return res.status(201).json(
//         new ApiResponse(200,createdUser, "User Registered Successfully")
//     )
// })

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password, isAdmin, masterUsername } = req.body;

    if (!fullName || !email || !password || !username) {
        throw new ApiError(400, "All fields are required.");
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }],
    });
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.");
    }

    const masterUser = await User.findOne({ username: masterUsername.toLowerCase() });
    


    if (!isAdmin) {
        const user = await User.create({
            fullName,
            email,
            password,
            username: username.toLowerCase(),
            isAdmin: false,
            master: masterUser._id,
        });

        if (!user) {
            throw new ApiError(403, "User not created.");
        }

        
        if (!masterUser) {
            throw new ApiError(404, "Master user not found.");
        }

        masterUser.employees.push(user._id);
        await masterUser.save().catch((err) => {
            throw new ApiError(500, "Failed to update master user.");
        });

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Employee Registered Successfully"));
    }

    const user = await User.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        isAdmin: true,
    });

    const createdUser = await User.findById(user._id)
        .select("-password -refreshToken")
        .populate("employees master");
    if (!createdUser) {
        throw new ApiError(501, "Something went wrong while registering the user.");
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "Admin Registered Successfully")
        );
});


const loginUser = asyncHandler(async(req,res)=>{
   
   const { email , password } = req.body;
    // console.log(email,password);
   if(!email || !password){
    throw new ApiError(400, "Email and Password is required")
   }
   const user  = await User.findOne({email})
   if(!user){
    throw new ApiError(401, "User does not exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password);
   if(!isPasswordValid){
    throw new ApiError(402, "Incorrect Password")
   }

   const {accessToken, refreshToken} =await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
   
   const options = {
    httpOnly:true,
    secure: true,
   }
   res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
    new ApiResponse(200,{
        user: loggedInUser, accessToken,refreshToken
    },
    "User Loggin in Successfully")
   )


})

const logOutUser = asyncHandler(async(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken: undefined
        }
    },
    {
        new: true,
    }
    )
    const options = {
    httpOnly:true,
    secure: true,
   }
   return res
   .status(200)
   .clearCookie("accessToken", options)
   .clearCookie("refreshToken", options)
   .json(new ApiResponse(200,{},"User Logged Out successfully"))

})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(402, "Refresh token is expired.")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
        res
        .status(200)
        .cookie("accessToken",newAccessToken, options)
        .cookie("refreshToken",newRefreshToken, options)
        .json(
            new ApiResponse(
                200, {accessToken, refreshToken:newRefreshToken}, "access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(402, "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res)=>{
    const {oldPassword, newPassword, confPassword} = req.body;
    const user = await User.findById(req.user._id);

    if(newPassword !== confPassword){
        throw new ApiError(402, "Passwords do not match")
    }

    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(402, "Old password is not correct")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200, "Password saved successfully"))
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"))
})



export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,

}