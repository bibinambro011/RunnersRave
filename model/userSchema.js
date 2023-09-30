const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
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
      status: {
        type: Boolean,
        default: true,
      }
    },
    {timestamps:true}
    );

module.exports = mongoose.model("runnerslogins", userSchema); 