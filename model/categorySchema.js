const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    },
    categoryOffer:{
      type:Number,
      default:0
    },
    offerValidFrom:{
      type:Date,
      default:Date.now,
      
    },
    offerValidTo:{
      type:Date,
      default:Date.now,
    }

    
  }
);

module.exports = mongoose.model("CategoryCollection", categorySchema);
