const Product = require("../model/productSchema");
const User = require("../model/userSchema");
const addressSchema = require("../model/addresses");
const Cart = require("../model/cartSchema");
const Order = require("../model/orderSchema");
const coupon = require("../model/couponSchema");

const addtocart = async (req, res) => {
  const productId = req.params.id;
  const userId = req.session.user[0]._id;
  const exproduct = await Product.findById(productId);
  const exiStock = exproduct.stock;
  const size = exproduct.size;
  const getimage = exproduct.images[0];

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      const newCart = new Cart({
        userId,
        products: [
          {
            productId,
            size: size,
            images: getimage,
            quantity: 1,
            price: exproduct.selling_price,
          },
        ],
      });
      await newCart.save();
    } else {
      const existingProduct = cart.products.find(
        (product) =>
          product.productId.toString() === productId && product.size == size
      );

      if (existingProduct) {
        if (exiStock > existingProduct.quantity) {
          existingProduct.quantity++;
        }
      } else {
        cart.products.push({
          productId,
          size: size,
          quantity: 1,
          images: getimage,
          price: exproduct.selling_price,
        });
      }

      await cart.save();
    }

    const isAuthenticated = true;
    const products = await Product.find({ status: "unblocked" });
    // res.render("user/home", { isAuthenticated, products });
    res.redirect("/shop");
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const addtocartfrompage = async (req, res) => {
  const { productId, size, quantity } = req.body;
  const userId = req.session.user[0]._id;

  const exproduct = await Product.findById(productId);

  try {
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      const newCart = new Cart({
        userId,
        products: [
          {
            productId,
            size: size,
            quantity: quantity,
            price: exproduct.selling_price,
          },
        ],
      });

      await newCart.save();
    } else {
      const existingProduct = cart.products.find(
        (product) =>
          product.productId.toString() === productId && product.size == size
      );

      if (existingProduct) {
        existingProduct.quantity += quantity;
      } else {
        cart.products.push({
          productId,
          quantity: quantity,
          size: size,
          price: exproduct.selling_price,
        });
      }

      await cart.save();
    }

    const isAuthenticated = true;
    const products = await Product.find({ status: "unblocked" });
    res.json({ redirectUrl: "/shop" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const showcart = async (req, res) => {
  const userId = req.session.user[0]._id;
  const cart = await Cart.findOne({ userId: userId }).populate({
    path: "products.productId",
    model: "productCollection",
  });
  if (cart) {
    const carttototal = cart.totalSum;

    const isAuthenticated = true;
    res.render("user/cart", { isAuthenticated, cart, carttototal });
  } else {
    const carttototal = 0;

    const isAuthenticated = true;
    res.render("user/cart", { isAuthenticated, cart, carttototal });
  }
};

let originaltotal = "";
const placeorder = async (req, res) => {
  const userId = req.session.user[0]._id;
  const cart = await Cart.findOne({ userId: userId }).populate({
    path: "products.productId",
    model: "productCollection",
  });
  let totalPrice = 0;
  if (cart && cart.products.length > 0) {
    cart.products.forEach((product) => {
      const quantity = product.quantity;
      const price = product.productId.selling_price;
      const productTotal = quantity * price;
      totalPrice += productTotal;
    });
  }
  const carttototal = totalPrice;
  originaltotal = totalPrice;
  const isAuthenticated = true;
  const Coupon = await coupon.find();

  res.render("user/placeOrder", {
    isAuthenticated,
    cart,
    carttototal,
    Coupon,
    originaltotal,
  });
};

const cartproductdelete = async (req, res) => {
  const userid = req.session.user[0]._id;
  const id = req.params.id;
  await Cart.updateOne(
    {
      userId: userid,
    },
    {
      $pull: { products: { productId: id } },
    }
  );

  res.redirect("/show_cart");
};

//applying coupon

const cartUpdate = async (req, res) => {
  try {
    const userId = req.session.user[0]._id;
    const { productId, quantity, total } = req.body;

    const cart = await Cart.findOne({ userId: userId });

    const productIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    // Update the product's quantity and total
    cart.products[productIndex].quantity = quantity;
    // cart.products[productIndex].price = total;

    await cart.save();

    return res.status(200).json({ message: "Cart updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
const checkoutpage = async (req, res) => {
  const discountamount = req.query.discountAmount;
  const couponcode = req.query.code;

  if (req.session.user) {
    const userId = req.session.user[0]._id;
    const cart = await Cart.findOne({ userId: userId }).populate({
      path: "products.productId",
      model: "productCollection",
    });

    let totalPrice = 0;
    if (cart && cart.products.length > 0) {
      cart.products.forEach((product) => {
        const quantity = product.quantity;
        const price = product.productId.selling_price;
        const productTotal = quantity * price;
        totalPrice += productTotal;
      });
    }
    const subtotal = totalPrice - discountamount;
    const userData = await addressSchema.find({ userId: userId });

    let isAuthenticated = true;
    res.render("user/checkout", {
      isAuthenticated,
      userData,
      cart,
      discountamount,
      code: couponcode,
      subtotal,
    });
  } else {
    let isAuthenticated = false;
    res.render("user/checkout", { isAuthenticated });
  }
};
module.exports = {
  addtocart,
  addtocartfrompage,
  showcart,
  cartUpdate,
  placeorder,
  cartproductdelete,
  checkoutpage,
};
