const mongoose = require("mongoose");

const offerModel = new mongoose.Schema({
 
    
    referraloffer:{
        type:Number,
        default:0

      },
      referredoffer: {
        type: Number,
      
        default: 0,
      },
     
    },
 
);



module.exports = mongoose.model("offermodel", offerModel);
