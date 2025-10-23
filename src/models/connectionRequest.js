const mongoose = require('mongoose');
const connectionRequestSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId, // type of _id
        required:true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId, // type of _id
        required:true
    },
    status: {
        type:String,
        required:true,
        enum:{
            values:["ignored","interested","accepted","rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
}, {timestamps:true}
);

//Creating compound Index for fromUserId,toUserId
connectionRequestSchema.index({fromUserId:1, toUserId:1});

module.exports = mongoose.model("ConnectionRequest",connectionRequestSchema);



