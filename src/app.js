const express=require("express");
const connectdb=require("./config/database");

const app=express();

const authRouter=require("./routes/authRoute");
const profileRouter=require("./routes/profileRouter");
const requestRouter=require("./routes/requestRouter")
const userRouter=require("./routes/userRoute");
const cors=require("cors");
require("dotenv").config();

const cookieParser = require("cookie-parser");
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());
app.use(cookieParser());

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
 

connectdb().then(()=>{
    console.log("db connected");
    app.listen(process.env.PORT,()=>{
        console.log("sever is running");
    });
}).catch((err)=>console.log("error in connecting"));



