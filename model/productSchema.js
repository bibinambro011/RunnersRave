const mongoose=require("mongoose")
const productschema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    selling_price: {
      type: Number,
      required: true,
    },
    created_on: {
      type: Date, default: Date.now()
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"CategoryCollection",
      required:true
    },
    size: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    
    brand:{
      type:String,
      required:true,
    },
    stock: {
      type: Number,
      required: true,
    },
    status:{
      default:"unblocked",
      type:String
    },
    // img: [
    //   {
    //     data: Buffer,
    //     contentType: String,
    //   },
    // ],
    images: [
      {
        type: String  // Assuming you store image URLs as strings
      }
    ],
  });
  module.exports = mongoose.model("productCollection", productschema);
  

  