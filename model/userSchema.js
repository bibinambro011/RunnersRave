const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
      },
      referralId: {
        type: String,
        unique: true,
       
        default: generateRandomReferralID,
    },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    
      password: {
        type:String,
        required: true,
      },
      addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'addressModel', // Reference to the Address model
     }],
     wishlist:[
      {
          type:mongoose.Schema.Types.ObjectId,
          ref:'productCollection'
      }
  ],
     walletbalance: {
      type: Number,
      default:0
      
   },
      status: {
        type: Boolean,
        default: true,
      }
    },
    {timestamps:true}
    );

    function generateRandomReferralID() {
      const min = 100000; // 6-digit minimum value
      const max = 999999; // 6-digit maximum value
  
      // Generate a random number between min and max (inclusive)
      const randomReferralID = Math.floor(Math.random() * (max - min + 1)) + min;
  
      // Convert the random number to a string
      return randomReferralID.toString();
  }
  

module.exports = mongoose.model("runnerslogins", userSchema); 