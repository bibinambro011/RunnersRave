const mongoose = require("mongoose");

const cartModel = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
     ref: "runnerslogins",
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "productCollection",
        required: true,
      },
      images: [
        {
          type: String  // Assuming you store image URLs as strings
        }
      ],
    
      size:{
        type:String,
        default:7

      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
      price: {
        type: Number,
        default: 0,
      },
    },
  ],
  
});



module.exports = mongoose.model("Cart", cartModel);
