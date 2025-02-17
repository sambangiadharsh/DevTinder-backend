const mongoose=require("mongoose");

const connectdb=async()=>{
    await  mongoose.connect("mongodb+srv://sambangialex:J8t5eQWEyty2zj9h@cluster0.ahlz3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
}

module.exports=connectdb;