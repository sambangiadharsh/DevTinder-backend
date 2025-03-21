const express=require("express");
const connectdb=require("./config/database");
const path =require("path");

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

app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
const PORT = process.env.PORT || 7777; // Fallback to 7777 if PORT is not set


connectdb().then(()=>{
    console.log("db connected");
    server.listen(PORT,()=>{
        console.log("sever is running");
    });
}).catch((err)=>console.log("error in connecting"));



