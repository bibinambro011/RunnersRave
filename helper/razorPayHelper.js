const Razorpay = require('razorpay');
const Crypto = require('crypto');
const Order = require('../model/orderSchema');
require("dotenv").config();

var instance = new Razorpay({
    // key_id:'rzp_test_Q7ihmFOtXoqBDe',
    // key_secret: 'jG2msJP2eDEVdV6E7peUXdPR',
    key_id:'rzp_test_9CEMr0p0borLvv',
    key_secret: 'Ki2cAMKxf2JxKvJRQh2Xiq6U'
  });

  const generateRazorPay = async(orderId,total)=>{
    return new Promise((resolve,reject)=>{
       var options = {
          amount: total *100,
          currency:"INR",
          receipt:orderId,
       };
       instance.orders.create(options,function(err,order){
          console.log("New order from razorpay :",order);
          resolve(order)
       }); 
    })

 }

 const verifyOnlinePayment = async(details)=>{
   console.log('VerifyOnlinPayment: ',details);
   return new Promise((resolve,reject)=>{
      let hmac = Crypto.createHmac('sha256','Ki2cAMKxf2JxKvJRQh2Xiq6U');
     
      hmac.update(details.payment.razorpay_order_id+'|'+details.payment.razorpay_payment_id);
      // Converted to string format
      hmac = hmac.digest('hex');
    
      if(hmac == details.payment.razorpay_signature){
         // If it matches we resolve it 
         resolve();
      }else{
         // Doesn't match we reject
         reject();
      }
   })
}

const updatePaymentStatus = (orderId,paymentStatus)=>{
   return new Promise(async(resolve,reject)=>{
      try {
         if(paymentStatus){
            const orderUpdate = await Order.findByIdAndUpdate({_id:new Object(orderId)},{$set:{orderStatus:'Confirmed',paymentStatus:"paid"}})
            .then(()=>{
               resolve();
            });
         }else{
            const orderUpdate = await Order.findByIdAndUpdate({_id:new Object(orderId)},{$set:{orderStatus:'Failed'}})
            .then(()=>{
               resolve()
            });
         }
      } catch (error) {
         reject(error);
         console.log(error.message);
      }
   })
}

module.exports ={
   generateRazorPay,
   verifyOnlinePayment,
   updatePaymentStatus,
}
