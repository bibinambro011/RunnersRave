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
        type: String,
        required: true,
      },
      is_blocked: {
        type: Boolean,
        default: false,
      }
    },
    {timestamps:true}
    );

module.exports = mongoose.model("runnerslogins", userSchema); 