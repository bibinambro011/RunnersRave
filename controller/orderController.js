const Order=require("../model/orderSchema");
const User=require("../model/userSchema");
const Address=require("../model/addresses");
const Product=require("../model/productSchema");
const Cart=require("../model/cartSchema")



const orderdetails = async (req, res) => {
    console.log(req.body)
    try {
      const userId = req.session.user[0]._id;
        const username=await User.find({_id:userId})
        
      // Retrieve order and cart details for the user
      const orderDetails = await Order.findOne({ userId });
      const cartDetails = await Cart.findOne({ userId }).populate({
        path: 'products.productId',
        model: 'productCollection'
      });
      console.log("inside orderdetails")
  
      // Calculate total price and original price
      let totalPrice = 0;
      let originalPrice = 0;
  
      if (cartDetails && cartDetails.products.length > 0) {
        cartDetails.products.forEach(product => {
          const quantity = product.quantity;
          const price = product.productId.selling_price;
          const actualPrice = product.productId.price;
  
          const productTotal = quantity * price;
          originalPrice += quantity * actualPrice;
          totalPrice += productTotal;
        });
      }
  
      // Create a new order if order details don't exist for the user
      if (!orderDetails) {
        const newOrder = new Order({
          userId,
          date: Date.now(),
          totalAmount: totalPrice,
          actualTotalAmount: originalPrice,
          paymentMethod: 'cash on delivery',
          products: cartDetails.products, // Assuming products are fetched from cart
          address: {
            // Add the user's address details here
            name: username[0].username,
            mobile: '1234567890',
            homeAddress: '1234 Example St',
            city: 'Example City',
            postalCode: 12345
          },
          orderStatus: 'Pending',
          returnOrderStatus: {
            status: 'Not requested',
            reason: 'No reason'
          }
        });
  
        // Save the new order
        await newOrder.save();
        
        // Optionally, you can clear the user's cart after creating the order
        await Cart.findOneAndUpdate({ userId }, { products: [] });
  
        return res.status(200).json({ message: 'Order created successfully' });
      } else {
        const newOrder = new Order({
            userId,
            date: Date.now(),
            totalAmount: totalPrice,
            actualTotalAmount: originalPrice,
            paymentMethod: 'cash on delivery',
            products: cartDetails.products, // Assuming products are fetched from cart
            address: {
              // Add the user's address details here
              name: username[0].username,
              mobile: '1234567890',
              homeAddress: '1234 Example St',
              city: 'Example City',
              postalCode: 12345
            },
            orderStatus: 'Pending',
            returnOrderStatus: {
              status: 'Not requested',
              reason: 'No reason'
            }
          });
    
          // Save the new order
          await newOrder.save();
          await Cart.findOneAndUpdate({ userId }, { products: [] });
        return res.status(200).json({ message: 'successfully added to order details' });
      }
    } catch (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
module.exports={orderdetails}