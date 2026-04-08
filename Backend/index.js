import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import courseRoute from "./routes/course.route.js";
import userRoute from "./routes/user.route.js";
import adminRoute from "./routes/admin.route.js";
import orderRoute from "./routes/order.route.js";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config();

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "./tmp",
  })
);
app.use(cors({
  origin:process.env.FRONTEND_URL,
  credentials:true ,
  methods:["GET","POST","PUT","DELETE"],  
  allowedHeaders:["Content-Type","Authorization"],

}));


const port=process.env.PORT||4001;//4001 is busy then server run at 3000
// removed hello world part
const DB_URI=process.env.MONGO_URI
try{

   await mongoose.connect(DB_URI);
  console.log("connected to MongoDB")
}catch(error){
  console.log(error);
}
//defining routes or middleware
app.use("/api/v1/user",userRoute)
app.use("/api/v1/course",courseRoute)
app.use("/api/v1/admin",adminRoute)
app.use("/api/v1/order",orderRoute)
//Cloudinary configuration code
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});  