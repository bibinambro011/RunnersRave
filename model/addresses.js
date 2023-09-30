const mongoose = require("mongoose");

const addressModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  mobile: {
    type: Number,
    required: true,
  },
  alt_mobile: {
    type: Number,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "runnerslogin", // Reference to the User model
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("addressModel", addressModel);
