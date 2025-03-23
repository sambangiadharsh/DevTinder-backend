const { userAuth } =require("../middlewares/auth");
const express=require("express");
const payment=require("../models/payment");
const razorpayInstance=require("../utils/razorpay");
const { membershipAmount } = require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')
const user =require("../models/user")

const paymentRouter=express.Router();

paymentRouter.post("/payment/create",userAuth,async(req,res)=>{
    try{
        const  {membershipType}=req.body;
        const {firstName,lastName,emailId}=req.user;
      const order=await razorpayInstance.orders.create({
         amount:membershipAmount[membershipType],
         currency:"INR",
         receipt:"recepient$1",
         notes:{
            firstName,
            lastName,
            emailId,
            membershipType:membershipType
         },
      });
     
      const newPayment=new payment({
        userId:req.user._id,
        orderId:order.id,
        amount:order.amount,
        status:order.status,
        currency:order.currency,
        receipt:order.receipt,
        notes:order.notes,
      });

      const savedPayment=await newPayment.save();
      res.json({savedPayment,keyId:process.env.RAZORPAY_KEY_ID});
    }
    catch(err){
        res.status(400).json({msg:err.message});
    }
})

paymentRouter.post("/payment/webhook",async(req,res)=>{
 try{
   const webhookSignature=req.get("X-Razorpay-Signature");
  const isWebhhookValid=validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.WEBHOOK_SECRET)

  if(!isWebhhookValid){
    return res.status(400).json({
      msg:"webhook is not valid"
    })
  }
  

  const paymentDetails=req.body.payload.payment.entity;

  const pay=await payment.findOne({
    orderId:paymentDetails.order_id
  });
  if (!pay) {
    return res.status(404).json({ msg: '❗️ Payment record not found!' });
  }
  pay.status=paymentDetails.status;
  await pay.save();

  const paymentUser=await user.findById(pay.userId)
  if (paymentDetails.status === 'captured') {
    paymentUser.isPremium = true;
    paymentUser.membershipType = pay.notes.membershipType;

    // Set membership duration based on type (Gold or Silver)
    let membershipDays = 0;
    switch (pay.notes.membershipType.toLowerCase()) {
      case 'gold':
        membershipDays = 180; // 6 months for Gold
        break;
      case 'silver':
        membershipDays = 90; // 3 months for Silver
        break;
      default:
        membershipDays = 30; // Default to 1 month if type is not specified
        break;
    }
    paymentUser.membershipValidity = new Date(
      Date.now() + membershipDays * 24 * 60 * 60 * 1000
    );

  }

  await paymentUser.save();
  
  res.status(200).json({msg:"webhook received successfully"});
 }
 catch(err){
    res.json({msg:err.message});
 }
});

paymentRouter.get("/payment/verify",userAuth,(req,res)=>{
  const User=req.user;
  if(User.isPremium){
    return res.json({isPremium:true});
  }
  return res.json({isPremium:false});
})

module.exports=paymentRouter