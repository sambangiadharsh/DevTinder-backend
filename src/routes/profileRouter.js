const express=require("express");
const profileRouter=express.Router();
const {userAuth}=require("../middlewares/auth");

const {validateEditData}=require("../utils/validate");
profileRouter.get("/profile/view", userAuth,async (req, res) => {
    try {
      res.json(user); // Send user data to frontend
    } catch (error) {
      res.status(401).json({ message: "Invalid Token" });
    }
  });
profileRouter.post("/logout",userAuth,async(req,res)=>{
    res.cookie("token",null,{
        expires:new Date(Date.now()),
    });
    res.send("logout successfully");
})

profileRouter.patch("/profile/edit",userAuth,async(req,res)=>{
      try{
        if(!validateEditData(req)){
            throw new Error("invalid edit data");
        }
        
        const loggedinUser=req.user;
        Object.keys(req.body).forEach((key)=>(loggedinUser[key]=req.body[key]));
        console.log(loggedinUser);
        await loggedinUser.save();
        res.json({
            "message":`${loggedinUser.firstName} your profile is updated successfully`,
            data:loggedinUser,
        })
      }
      catch(err){
        res.status(400).send("error:"+err.message);
      }
})
module.exports=profileRouter;