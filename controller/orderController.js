const Order = require("../model/orderSchema");
const User = require("../model/userSchema");
const Address = require("../model/addresses");
const Product = require("../model/productSchema");
const Cart = require("../model/cartSchema");

const orderdetails = async (req, res) => {
  console.log(req.body);
  const { address, city, pincode, mobil } = req.body;

  try {
    const userId = req.session.user[0]._id;
    const username = await User.find({ _id: userId });

    // Retrieve order and cart details for the user
    const orderDetails = await Order.findOne({ userId });
    const cartDetails = await Cart.findOne({ userId }).populate({
      path: "products.productId",
      model: "productCollection",
    });

    // Calculate total price and original price
    let totalPrice = 0;
    let originalPrice = 0;

    if (cartDetails && cartDetails.products.length > 0) {
      const stockUpdates = []; // Array to store the stock update operations

      cartDetails.products.forEach((product) => {
        const quantity = product.quantity;
        const productId = product.productId._id; // Assuming this is the product ID

        const price = product.productId.selling_price;
        const actualPrice = product.productId.price;
        const stockUpdate = {
          updateOne: {
            filter: { _id: productId },
            update: { $inc: { stock: -quantity } } // Decrease the stock by the product quantity
          }
        };

        stockUpdates.push(stockUpdate);

        const productTotal = quantity * price;
        originalPrice += quantity * actualPrice;
        totalPrice += productTotal;
      });

      // Perform bulk updates to decrease the stock
      await Product.bulkWrite(stockUpdates, { ordered: false });
    }


    // Create a new order if order details don't exist for the user
    if (!orderDetails) {
      const newOrder = new Order({
        userId,
        date: Date.now(),
        totalAmount: totalPrice,
        actualTotalAmount: originalPrice,
        paymentMethod: "cash on delivery",
        products: cartDetails.products, // Assuming products are fetched from cart
        address: {
          // Add the user's address details here
          name: username[0].username,
          mobile: mobil,
          homeAddress: address,
          city: city,
          postalCode: pincode,
        },
        orderStatus: "Pending",
        returnOrderStatus: {
          status: "Not requested",
          reason: "No reason",
        },
      });

      await newOrder.save();

      await Cart.findOneAndUpdate({ userId }, { products: [] });

      return res.status(200).json({ message: "Order created successfully" });
    } else {
      const newOrder = new Order({
        userId,
        date: Date.now(),
        totalAmount: totalPrice,
        actualTotalAmount: originalPrice,
        paymentMethod: "cash on delivery",
        products: cartDetails.products,
        address: {
          name: username[0].username,
          mobile: mobil,
          homeAddress: address,
          city: city,
          postalCode: pincode,
        },
        orderStatus: "Pending",
        returnOrderStatus: {
          status: "Not requested",
          reason: "No reason",
        },
      });

      await newOrder.save();
      await Cart.findOneAndUpdate({ userId }, { products: [] });
      return res.status(200).json({
        message: "Order created successfully",
        redirectUrl: "/orderplacedsuccessfully" // Specify the desired redirect URL here
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
  const order = await Order.findById(orderId)
    .populate({
      path: "products.productId", // Populate the 'productId' field
      model: "productCollection", // Replace with the correct model name for products
    })
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
            update: { $inc: { stock: +quantity } } // Decrease the stock by the product quantity
          }
        };

        stockUpdates.push(stockUpdate);

       
      });
      await Product.bulkWrite(stockUpdates, { ordered: false });
    }

  try {
    const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus: 'Cancelled' }, { new: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log("before updation")
    res.redirect("/useraccount")

  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


const orderplacedsuccessfully=async(req,res)=>{
  const isAuthenticated=true;
  res.render("user/orderplaced",{isAuthenticated})

}
const orderdetailsofuser=async(req,res)=>{
  const id=req.params.id;
 const order=await Order.findById(id).populate({
  path: "products.productId", // Populate the 'productId' field
  model: "productCollection", // Replace with the correct model name for products
})


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

  res.render("admin/page_order_details",{order,totalPrice})
}
const updateorderstatus=async(req,res)=>{
  const updatedData=req.body;
 

  const id=req.params.orderId
  console.log(id);
 
  const updatedOrder = await Order.findByIdAndUpdate(id, { orderStatus: updatedData.orderStatus }, { new: true });
  return res.status(200).json({
    message: "Order created successfully",
    redirectUrl: `/admin/order_details/${id}` // Specify the desired redirect URL here
  });
 
}
module.exports = { orderdetails, ordernfo,cancelOrder,orderplacedsuccessfully ,orderdetailsofuser,updateorderstatus};
