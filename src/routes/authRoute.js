const express=require("express");
const authRouter=express.Router();
const {userAuth}=require("../middlewares/auth");
const {validate}=require("../utils/validate");
const User=require("../models/user");
const bcrypt=require("bcrypt");

authRouter.post("/signup",async(req,res)=>{
    console.log(req.body); 


try{
    validate(req);
    
    
    const user=new User(req.body);
    await user.hashPassword();
    const data=await user.save();
   
    const token=await user.getJWT();
    res.cookie("token", token, {
        httpOnly: true, // Prevents client-side JS access
        secure: false, // Set `true` in production with HTTPS
      
        maxAge: 60 * 60 * 1000, // 1 hour expiry
    });

    res.cookie("token",token);

        
    res.status(201).json({
        message:"Data inserted succesfully",
        data,
    })
}
catch(error){
    console.error("Error inserting user:", error.message);
        res.status(400).send("Not inserted: " + error.message);
}

})


authRouter.post("/login",async(req,res)=>{
    try{
        const {emailId,password}=req.body;
        
        const user=await User.findOne({emailId:emailId});
        
        if(!user){
            return res.status(401).send("Invalid credentials");
        }
     
        const isPasswordValid=await user.validatepassword(password);
        
        
        if(isPasswordValid){
            const token=await user.getJWT();
        res.cookie("token", token, {
            httpOnly: true, // Prevents client-side JS access
            secure: false, // Set `true` in production with HTTPS
          
            maxAge: 60 * 60 * 1000, // 1 hour expiry
        });

            res.cookie("token",token);

            res.send(user);
        }
        else{
            return res.status(401).send("Invalid Password");
        }
    }
    catch{
        res.status(401).send("bad request");
    }
})

module.exports=authRouter;