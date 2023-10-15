const mongoose = require('mongoose');

const ordersModel = new mongoose.Schema({
   ord:{
      type:String,
      default:function(){
         return Math.floor(100000 + Math.random() * 900000).toString();
      }
   },
   userId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'runnerslogins',
   },
   date:{
      type:Date,
      default:Date.now,
      required:true,
   },
   couponDiscount:{
      type:Number,
      default:0
   },
   totalAmount:{
      type:Number,
      required:true,
   },
   actualTotalAmount:{
      type:Number,
      required:true
   },
   paymentMethod:{
      type:String,
   },
   paymentStatus:{
      type:String,
      default:"pending"
   },

   products:[{
      productId:{
         type:mongoose.Types.ObjectId,
         ref:'productCollection'
      },
      quantity:{
         type:Number,
      },
      salePrice:{
         type:Number,
      },
      price:{
         type:Number,
         default:0,
      },
      productStatus:{
         type:String,
         default:'Pending'
      }
   }],
   address:{
      name:{
         type:String,
         required:true,
      },
      mobile:{
         type:Number,
         required:true,
      },
      homeAddress:{
         type:String,
         required:true,
      },
      city:{
         type:String,
         required:true,
      },
      
      postalCode:{
         type:Number,
         required:true
      }
   },
   orderStatus:{
      type:String,
      default:'Pending',
   },
   returnOrderStatus:{
      status:{
         type:String,
         default:'Not requested'
      },
      reason:{
         type:String,
         default:'No reason'
      }
   }
})

module.exports = mongoose.model('Order',ordersModel);