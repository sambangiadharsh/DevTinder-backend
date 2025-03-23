const mongoose=require("mongoose");


const paymentSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Types.ObjectId,
        ref:"user",
        required:true
    },
    paymentId:{
        type:String,
        
    },
    orderId:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true
    },
    receipt:{
        type:String,
        required:true
    },
    notes:{
        firstName:{
            type:String,
            
        },
        lastName:{
            type:String,
           
        },
        emailId:{
            type:String,
        },
        membershipType:{
            type:String,
            
        }

    },
},{timestamps:true});

const payment=mongoose.model("payment",paymentSchema);

module.exports=payment;