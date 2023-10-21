const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Address = require("../model/addresses");
const Product = require("../model/productSchema");
const Cart = require("../model/cartSchema");
const userHelper = require("../helper/razorPayHelper");

let orderId = "";
const orderdetails = async (req, res) => {
  const { address, city, pincode, mobil, paymentype } = req.body;

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
console.log("orderdetails are====>",cartDetails)
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
      totalAmount: totalPrice,
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

      //payment method

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
      } else {
        userHelper
          .generateRazorPay(newOrder._id, newOrder.totalAmount)
          .then((response) => {
            console.log("razorpay response is===>", response);
            return res.json({ status: "RAZORPAY", response: response });
          });
        // if (cartDetails) {
        //   cartDetails.products = [];
        //   await cartDetails.save();
        // }
      }
      // await Cart.findOneAndUpdate({ userId }, { products: [] });

      // const response = {
      //   message: "Order created successfully",
      //   redirectUrl: "/orderplacedsuccessfully"
      // };

      // return res.status(200).json(response);
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
    });

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
  console.log(id);

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
    { $set: { orderStatus: "payment Failed" } },
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
