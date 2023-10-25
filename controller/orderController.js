const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Address = require("../model/addresses");
const Product = require("../model/productSchema");
const Cart = require("../model/cartSchema");
const userHelper = require("../helper/razorPayHelper");
const Coupon=require("../model/couponSchema");
const UsedCoupon=require("../model/useCouponSchema");

let orderId = "";
const orderdetails = async (req, res) => {
  const userId=req.session.user[0]._id
  const { address, city, pincode, mobil, paymentype,amount,couponcode } = req.body;
  console.log( "coupon code is===> ",couponcode);
  const appliedCoupon = await Coupon.findOne({ couponCode: couponcode });
  if(appliedCoupon){
    appliedCoupon.redeemedusers.push(userId);
  
    // Save the updated coupon document
    await appliedCoupon.save();
  }
 

  try {
    const userId = req.session.user[0]._id;
    const username = await User.findOne({ _id: userId }, "username");

    const [orderDetails, cartDetails] = await Promise.all([
      Order.findOne({ userId }),
      Cart.findOne({ userId }).populate({
        path: "products.productId",
        model: "productCollection",
      }),
    ]);

    let totalPrice = 0;
    let originalPrice = 0;
    const stockUpdates = [];

    if (cartDetails && cartDetails.products.length > 0) {
      cartDetails.products.forEach((product) => {
        const quantity = product.quantity;
        const productId = product.productId._id;

        const price = product.productId.selling_price;
        const actualPrice = product.productId.price;

        const stockUpdate = {
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { stock: -quantity } },
          },
        };

        stockUpdates.push(stockUpdate);

        const productTotal = quantity * price;
        originalPrice += quantity * actualPrice;
        totalPrice += productTotal;
      });

      await Product.bulkWrite(stockUpdates, { ordered: false });
    }

    const newOrder = new Order({
      userId,
      date: Date.now(),
      totalAmount: totalPrice-amount,
      couponDiscount:amount,
      actualTotalAmount: originalPrice,
      paymentMethod: paymentype,
      products: cartDetails.products,
      address: {
        name: username.username,
        mobile: mobil,
        homeAddress: address,
        city: city,
        postalCode: pincode,
      },
      orderStatus: "Confirmed",
      returnOrderStatus: {
        status: "Not requested",
        reason: "No reason",
      },
    });
    if (newOrder.totalAmount != 0) {
      await newOrder.save();

      orderId = newOrder._id;

    
      

      if (newOrder.paymentMethod == "COD") {
        newOrder.paymentMethod = "Cash on delivery";
        await newOrder.save();
        if (cartDetails) {
          cartDetails.products = [];
          await cartDetails.save();
        }

        return res.json({
          status: "COD",
          placedOrderId: newOrder._id,
          redirectUrl: "/orderplacedsuccessfully",
        });
      }
      else if(newOrder.paymentMethod=="walletpayment"){
        console.log("inside wallet payment block");
      
        let userdata=await User.findOne({_id:req.session.user[0]._id});
        console.log("userdata details are==>",userdata)
       
        if(userdata.walletbalance<newOrder.totalAmount){
          console.log("inside lowwalletbalance");
       
          return res.json({
            status: "walletpayment",
            placedOrderId: newOrder._id,
            redirectUrl: "/lowWalletbalance",
          });
        }else{
          let userdata=await User.findOne({_id:req.session.user[0]._id});
         console.log("userdata ius==>",userdata)
         let balance=userdata.walletbalance-newOrder.totalAmount;
         let updatedbalance=Number(balance);
         console.log("wallet balance is==>",updatedbalance)
          let id=userdata._id
          let updatedata={
            walletbalance:updatedbalance
          };
          let updateddata = await User.findByIdAndUpdate(id, updatedata, { new: true });
          console.log("updated data is ===>", updateddata);
          if (cartDetails) {
            cartDetails.products = [];
            await cartDetails.save();
          }
         
          return res.json({
            status: "walletpayment",
            placedOrderId: newOrder._id,
            redirectUrl: "/successWalletpayment",
          });
        }

      } else if(newOrder.paymentMethod == "onlinePayment") {
        userHelper
          .generateRazorPay(newOrder._id, newOrder.totalAmount)
          .then((response) => {
            console.log("razorpay response is===>", response);
            return res.json({ status: "RAZORPAY", response: response });
          });
        
      }
      
    } else {
      return res.json({
        status: "COD",
        placedOrderId: newOrder._id,
        redirectUrl: "/checkoutpage",
      });
    }
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const ordernfo = async (req, res) => {
  const order = await Order.find({})
    .populate({
      path: "products.productId", // Populate the 'productId' field
      model: "productCollection", // Replace with the correct model name for products
    })
    .populate({
      path: "userId", // Populate the 'userId' field
      model: "runnerslogins", // Replace with the correct model name for users
    }).sort({ date: 1 });

  res.render("admin/page-orders", { order });
};
const cancelOrder = async (req, res) => {
  const orderId = req.params.orderId;
  const order = await Order.findById(orderId).populate({
    path: "products.productId", // Populate the 'productId' field
    model: "productCollection", // Replace with the correct model name for products
  });
  let totalPrice = 0;
  let originalPrice = 0;

  if (order && order.products.length > 0) {
    const stockUpdates = []; // Array to store the stock update operations

    order.products.forEach((product) => {
      const quantity = product.quantity;
      const productId = product.productId._id; // Assuming this is the product ID

      const stockUpdate = {
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { stock: +quantity } }, // Decrease the stock by the product quantity
        },
      };

      stockUpdates.push(stockUpdate);
    });
    await Product.bulkWrite(stockUpdates, { ordered: false });
  }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: "Cancelled" },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    console.log("before updation");
    res.redirect("/useraccount");
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const orderplacedsuccessfully = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/orderplaced", { isAuthenticated });
};
const orderdetailsofuser = async (req, res) => {
  const id = req.params.id;
  const order = await Order.findById(id).populate({
    path: "products.productId", // Populate the 'productId' field
    model: "productCollection", // Replace with the correct model name for products
  });

  let totalPrice = 0;
  let originalPrice = 0;
  if (order && order.products.length > 0) {
    // Array to store the stock update operations

    order.products.forEach((product) => {
      const quantity = product.quantity;
      const productId = product.productId._id; // Assuming this is the product ID

      const price = product.productId.selling_price;
      const actualPrice = product.productId.price;

      const productTotal = quantity * price;
      originalPrice += quantity * actualPrice;
      totalPrice += productTotal;
    });
  }

  res.render("admin/page_order_details", { order, totalPrice });
};
const updateorderstatus = async (req, res) => {
  const updatedData = req.body;

  const id = req.params.orderId;
  console.log(id);

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { orderStatus: updatedData.orderStatus },
    { new: true }
  );
  if(updatedData.orderStatus=="delivered"){
    console.log("hello world")
    await Order.findByIdAndUpdate(
      id,
      { paymentStatus: "paid" },
      { new: true }
    );

  }
  if(updatedData.orderStatus=="Cancelled"){
    console.log("hello world")
    await Order.findByIdAndUpdate(
      id,
      { admincancellreason: "failure in delivering the product" },
      { new: true }
    );

  }
  return res.status(200).json({
    message: "Order created successfully",
    redirectUrl: `/admin/order_details/${id}`, // Specify the desired redirect URL here
  });
};
const showUserOrder = async (req, res) => {
  const orderId = req.params.id;
  console.log(orderId);
  const order = await Order.findById(orderId).populate({
    path: "products.productId", // Populate the 'productId' field
    model: "productCollection", // Replace with the correct model name for products
  });
  let totalPrice = 0;
  let originalPrice = 0;
  if (order && order.products.length > 0) {
    // Array to store the stock update operations

    order.products.forEach((product) => {
      const quantity = product.quantity;
      const productId = product.productId._id; // Assuming this is the product ID

      const price = product.price
      const actualPrice = product.productId.price;

      const productTotal = quantity * price;
      originalPrice += quantity * actualPrice;
      totalPrice += productTotal;
    });
  }

  res.render("user/orderDetails", { order, totalPrice, isAuthenticated: true });
};
const verifyOnlinePayment = async (req, res) => {
  let data = req.body;
  let cart = await Cart.findOne({ userId: req.session.user[0]._id });
  console.log("cart details are===>", cart);
  cart.products = [];
  await cart.save();
  let receiptId = data.order.receipt;
  userHelper
    .verifyOnlinePayment(data)
    .then(() => {
      console.log("this is a payment success block");

      let paymentSuccess = true;
      userHelper.updatePaymentStatus(receiptId, paymentSuccess).then(() => {
        res.json({ status: "paymentSuccess", placedOrderId: receiptId });
      });
    })
    .catch((err) => {
      console.log("this is a payment failure block");
      console.log("Rejected");
      if (err) {
        console.log(err.message);

        let paymentSuccess = false;
        userHelper.updatePaymentStatus(receiptId, paymentSuccess);
      }
    });
};

const orderUpdatedStatusDetails = async (req, res) => {
  console.log(req.body);
  console.log(req.params.id);

  const updatedData = req.body;

  id = await req.params.id;
let orderdetails=await Order.findOne({_id:req.params.id})
  if(updatedData.orderStatus=="Return"){
    let userdata=await User.find({_id:req.session.user[0]._id});
  
    console.log("userdeata==>",userdata);
 
    walletbal=userdata[0].walletbalance+orderdetails.totalAmount;
    console.log(walletbal)
    let bal=Number(walletbal)
    data={
      walletbalance:bal
    };
    let orderdata={
      paymentStatus:"refunded"
    }

  
    let userdetails = await User.findByIdAndUpdate(req.session.user[0]._id, data, { new: true });
    let orederdata=await Order.findByIdAndUpdate(id,orderdata,{ new: true })

    const canceledOrder = await Order.findById(id);
    // Iterate through the products in the canceled order
    for (const productItem of canceledOrder.products) {
        const productId = productItem.productId;
        const quantityToReturn = productItem.quantity;

        // Find the corresponding product in your product collection
        const product = await Product.findById(productId);

        // Update the product's stock by adding the returned quantity
        if (product) {
            product.stock += quantityToReturn;

            // Save the updated product in the product collection
            await product.save();
        }
    }


  }
  if(updatedData.orderStatus=="Cancelled"){
    const canceledOrder = await Order.findById(id);
    for (const productItem of canceledOrder.products) {
      const productId = productItem.productId;
      const quantityToReturn = productItem.quantity;

      // Find the corresponding product in your product collection
      const product = await Product.findById(productId);

      // Update the product's stock by adding the returned quantity
      if (product) {
          product.stock += quantityToReturn;

          // Save the updated product in the product collection
          await product.save();
      }
  }


  //for checking payment method 
  if(canceledOrder.paymentMethod=="walletpayment"){
    let userdet=await User.find({_id:req.session.user[0]._id})
    let bal=canceledOrder.totalAmount+userdet[0].walletbalance;
    let balance=Number(bal)
    let userdat={
      walletbalance:balance
    }
    let updateuserdata = await User.findByIdAndUpdate(
  {
    _id: req.session.user[0]._id,
    paymentStatus: "refunded" // Additional condition
  },
  userdat,
  { new: true }
);

  }

  }
 

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    { orderStatus: updatedData.orderStatus },
    { new: true }
  );
  return res.status(200).json({
    message: "Order created successfully",
    redirectUrl: `/showUserOrder/${id}`, // Specify the desired redirect URL here
  });
};
const paymentFailureHandler = async (req, res) => {
  // let data=await Order.findOne({_id:orderId});
  console.log("order details are==>", orderId);
  let data = await Order.findOneAndUpdate(
    { _id: orderId }, // Query to find the document
    { 
      $set: { 
        orderStatus: "payment Failed",
        paymentStatus: "failed" // Add this line to update paymentStatus
      }
    },
    { new: true }
  );
  

  return res.status(200).json({
    redirectUrl: `/paymentFailure`, // Specify the desired redirect URL here
  });
};
const paymentFailure = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/paymentFailure", { isAuthenticated });
};
module.exports = {
  orderdetails,
  ordernfo,
  cancelOrder,
  orderplacedsuccessfully,
  orderdetailsofuser,
  updateorderstatus,
  showUserOrder,
  orderUpdatedStatusDetails,
  verifyOnlinePayment,
  paymentFailureHandler,
  paymentFailure,
};
