import connectDB from "./db/db.js";
import dotenv from "dotenv";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
})

connectDB().then(()=>{
    app.listen(process.env.PORT || 3000, ()=>{
        console.log("Running on PORT: ", process.env.PORT)
    })
}).catch((err)=>{
    console.log("\nMongoDB Connection Failed. \n",err)
});


