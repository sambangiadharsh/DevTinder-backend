const express=require("express");
const userRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const connectionRequest=require("../models/connectionRequest");
const User=require("../models/user");




userRouter.get("/user/request/received",userAuth,async(req,res)=>{
    try{
     const loggedinUser=req.user;

     const  data=await connectionRequest.find({
        toUserId:loggedinUser._id,
        status:"interested"
     }).populate("fromUserId","firstName lastName age photoUrl gender about skills");

     
    
     if(!data){
        res.status(200).json({
            message:"you dont have pending requests"
        })
     }

     res.status(200).json({
        message:"pending requests",
        data,
     })
    }
    catch(err){
        res.status(400).send("not able to load");
    }
});

userRouter.get("/user/connections",userAuth,async(req,res)=>{
    try{
        const loggedinUser=req.user;

        const connectionrequests=await connectionRequest.find({
            $or:[
                {
                    toUserId:loggedinUser._id,status:"accepted"
                },
                {
                    fromUserId:loggedinUser._id,status:"accepted"
                }
            ]
        }).populate("fromUserId toUserId","firstName lastName age photoUrl gender about skills");

        const data=connectionrequests.map((row)=>{
            if(row.fromUserId._id.toString()===loggedinUser._id.toString()){
                return row.toUserId;
            }
            return row.fromUserId;
            
        })

        res.status(200).json({
            message:"your connections",
            data,
        })

    }
    catch(err){
        res.status(400).json({
            message:"bad request"
        })
    }
});


userRouter.get("/feed",userAuth,async(req,res)=>{
    try{
         const loggedinUser=req.user;
         const page=parseInt(req.query.page) || 1;
         let limit=parseInt(req.query.limit) || 10;
         limit=limit>50?50:limit;
         const skip=(page-1)*limit;
         const connectionrequests=await connectionRequest.find({
            $or:[
                {fromUserId:loggedinUser._id},
                {toUserId:loggedinUser._id}
            ]
         }).select("fromUserId toUserId");
         const hiddenusers=new Set();

         connectionrequests.forEach((req)=>{
            hiddenusers.add(req.fromUserId.toString());
            hiddenusers.add(req.toUserId.toString());
         })
        

         const users=await User.find({
            _id:{$nin:Array.from(hiddenusers)},
         }).select("_id firstName lastName age photoUrl gender about skills").skip(skip).limit(limit);

         return res.status(200).json({
            message:"suggest feeds",
            data:users,
         });
    }
    catch(err){
        res.send("bad request to not able to show profiles");
    }
})

module.exports=userRouter;