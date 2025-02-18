// const cron=require("node-cron");
// const {subDay,startOfDay,endOfDay}=require("data-fns");
// const connectionRequest = require("../models/connectionRequest");

// cron.schedule("* * * * *",()=>{
//     try{
       
//         const yesterday=subDay(new Date(),1);
//         const yesterdayStart=startOfDay(yesterday);
//         const yesterdayEnd=endOfDay(yesterday);

//         const pendingRequests=connectionRequest.find({
//             status:"interested",
//             createdAt:{
//                 $gte:yesterdayStart,
//                 $lt:yesterdayEnd,
//             },
//         }).populate("fromUserId toUserId");


//     }catch(err){
//         console.log(err);
//     }
// })