const express=require("express");
const connectdb=require("./config/database");

const app=express();
const authRouter=require("./routes/authRoute");
const profileRouter=require("./routes/profileRouter");
const requestRouter=require("./routes/requestRouter")
const userRouter=require("./routes/userRoute");
const initializeSockets = require("./sockets");
const chatRoute=require("./routes/chatRoute")
const cors=require("cors");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://devtender-frontend-fxuw.onrender.com"]
    : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // 
  })
);
app.use(express.json());
app.use(cookieParser());
const http = require('http');

const server = http.createServer(app);
initializeSockets(server);
app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/",requestRouter);
app.use("/",userRouter);
app.use("/",chatRoute);


const PORT=process.env.PORT || 7777
connectdb().then(()=>{
    console.log("db connected");
    server.listen(PORT,()=>{
        console.log("sever is running");
    });
}).catch((err)=>console.log("error in connecting"));



