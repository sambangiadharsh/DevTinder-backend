const express=require("express");
const requestRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const connectionRequest=require("../models/connectionRequest");
const User=require("../models/user");

requestRouter.post("/request/send/:status/:toUserId",userAuth,async(req,res)=>{
    try{
       const fromUserId=req.user._id;
       const toUserId=req.params.toUserId;
       const status=req.params.status;
       const allowedRequests=["interested","ignore"];
       if(!allowedRequests.includes(status)){
          return res.status(400).json({
            message:"Invalid status type :"+status
          })
       }

       const existConnectionRequest=await connectionRequest.findOne({
        $or:[
            {
                fromUserId,
                toUserId
            },
            {
                fromUserId:toUserId,
                toUserId:fromUserId
            }

        ]
       });
       if(existConnectionRequest){
        return res.status(400).json({
            message:"connection is already present "
        });
       }

       const user=await User.findById(toUserId);
       if(!user){
        res.status(400).json({
            message:"other user is not there"
        })
       };


       const connectionrequest=new connectionRequest({
        fromUserId,
        toUserId,
        status
       });

       const data=await connectionrequest.save();
       res.json({
        message:"connection requst successfully",
        data,
       });
       
    }
    catch(err){
        res.status(400).send("ERROR:"+err.message);
    }
});

requestRouter.post("/request/review/:status/:reqId",userAuth, async(req,res)=>{
       const loggedinUser=req.user;
       const requestId=req.params.reqId;
       const status=req.params.status;
       const allowedFields=["accepted","rejected"];

       try{
        if(!allowedFields.includes(status)){
            return res.status(400).json({
                message:"status is not allowed"
            });
           }
    
           const connectionrequest=await connectionRequest.findOne({
            _id:requestId,
            toUserId:loggedinUser._id,
            status:"interested"
           });
            
           if(!connectionrequest){
            return res.status(400).json({
                message:"connection request not found"
            });
           }
    
           connectionrequest.status=status;
           const data=await connectionrequest.save();
    
           res.status(200).json({
            message:"successfully accepted",
            data,
           });
       }
       catch(err){
           res.status(400).send(err);
       }


})

module.exports=requestRouter;
