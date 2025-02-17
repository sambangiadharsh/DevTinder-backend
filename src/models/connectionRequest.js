const mongoose=require("mongoose");

const connectionrequestSchema=mongoose.Schema({
    fromUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",//reference to user collection
        required:true
    },
    toUserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:{
        values:["ignore","accepted","rejected","interested"],
        message:`{value} is incorrect status` 
        }
         
    }
},
{
    timestamps:true
}

);

connectionrequestSchema.pre("save",function(next){
    const connectionRequest=this;
     if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("send request to yourself not allowed");
     }
     next();
})

const connectionRequest=new mongoose.model("connectionRequest",connectionrequestSchema);

module.exports=connectionRequest;