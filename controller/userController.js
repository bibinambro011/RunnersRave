const Product = require("../model/productSchema");
const addressSchema = require("../model/addresses");
const User = require("../model/userSchema");
const category = require("../model/categorySchema");
const cartCollection = require("../model/cartSchema");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const { userexist } = require("../middleware/userAuth");
const { json } = require("express/lib/response");
require("dotenv").config();

const accountSid = "AC7ed272bfc72e23f5ea62dde1140be05b";
const authToken = "847740e965bff24e69d8ca6aac7eaedc";

const client = twilio(accountSid, authToken);
let generatedotp = "";

function generateOtp() {
  const length = 6;
  const charset = "1234567890";
  otp = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    otp += charset[randomIndex];
  }
  generatedotp = otp;
  return otp;
}
let data;

const user_registration = async (req, res) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const phone = req.body.phone;
  data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    phone: req.body.password,
  };

  const recipientPhoneNumber = `+91${phone}`;

  // Validate phone number (simple length check)
  if (phone.length !== 10) {
    return res.render("user/register.ejs", {
      errordata: "Invalid phone number",
    });
  }

  let otp = generateOtp();

  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email,
      password: hashedPassword, // Store the hashed password
      phone,
    });

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "(469) 557-2151", // Replace with your Twilio phone number
      to: recipientPhoneNumber,
    });

    setTimeout(() => {
      generatedotp = null;
    }, 30000);

    res.render("user/otp.ejs", { otp }); // Render the OTP page
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.render("user/login.ejs", {
      errordata: "Failed to send OTP enter a valid number",
    });
  }
};

const regenerateOtp = async (req, res) => {
  const recipientPhoneNumber = `+91${data.phone}`;

  // Validate phone number (simple length check)
  if (data.phone.length !== 10) {
    return res.render("user/register.ejs", {
      errordata: "Invalid phone number",
    });
  }

  let otp = generateOtp();

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "(469) 557-2151", // Replace with your Twilio phone number
      to: recipientPhoneNumber,
    });

    res.render("user/otp.ejs", { otp }); // Render the OTP page
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.render("user/register.ejs", {
      errordata: "Failed to send OTP enter a valid number",
    });
  }
};

const verify_otp = async (req, res) => {
  const receivedOtp = req.query.otp;

  if (receivedOtp !== generatedotp) {
    return res.render("user/otp.ejs", { errordata: "Invalid OTP" });
  } else {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10); // Hash the password

      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        const isAuthenticated = false;
        return res.render("user/register.ejs", {
          errordata: "Email already exists",
          isAuthenticated,
        });
      }

      const newUser = new User({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        phone: data.phone,
      });

      await newUser.save();
      const isAuthenticated = true;
      res.redirect("/login");
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
};
const loginpage = async (req, res) => {
  res.render("user/login.ejs");
};

const registerpage = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/register.ejs", { isAuthenticated });
  } else {
    const isAuthenticated = false;
    res.render("user/register.ejs", { isAuthenticated });
  }
};
const signin = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/login.ejs", { isAuthenticated });
  } else {
    const isAuthenticated = false;
    res.render("user/login.ejs", { isAuthenticated });
  }
};
let username = "";

const userlogin = async (req, res) => {
  const userdata = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    let user = await User.findOne({ email: userdata.email });
    if (user.status == false) {
      const isAuthenticated = false;
      const data = "you are blocked";
      res.render("user/login", { data, isAuthenticated });
    }

    if (user) {
      const isPasswordValid = await bcrypt.compare(
        userdata.password,
        user.password
      );

      if (isPasswordValid) {
        req.session.user = userdata;
        const isAuthenticated = true;
        username = user.username;
        const products = await Product.find();
        res.render("user/home.ejs", { products, isAuthenticated });
      } else {
        const isAuthenticated = false;
        res.render("user/login.ejs", {
          errordata: "Invalid credentials",
          isAuthenticated,
        });
      }
    } else {
      const isAuthenticated = false;
      res.render("user/login.ejs", {
        errordata: "Invalid credentials",
        isAuthenticated,
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    const isAuthenticated = false;
    res.status(500).send("Internal Server Error");
  }
};
const userlogout = async (req, res) => {
  res.redirect("/login");
};
let prodId = "";
const productpage = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    const id = req.params.id;
    prodId = id;
    const product = await Product.findOne({ _id: id });
    res.render("user/productpage", { product, isAuthenticated });
  } else {
    const id = req.params.id;
    const isAuthenticated = false;
    const product = await Product.findOne({ _id: id });
    res.render("user/productpage.ejs", { product, isAuthenticated });
  }
};

const userhome = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    const products = await Product.find({ status: "unblocked" });
    res.render("user/home.ejs", { products, isAuthenticated });
  } else {
    const isAuthenticated = false;
    const products = await Product.find({ status: "unblocked" });
    res.render("user/home.ejs", { products, isAuthenticated });
  }
};
const shop = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    const categorydata = await category.find();

    const products = await Product.find({ status: "unblocked" });
    res.render("user/shop.ejs", { products, categorydata, isAuthenticated });
  } else {
    const categorydata = await category.find();
    const isAuthenticated = false;
    const products = await Product.find({ status: "unblocked" });
    res.render("user/shop.ejs", { products, categorydata, isAuthenticated });
  }
};

const addtocart = async (req, res) => {
  if (req.session.user) {
    let useremail = req.session.user.email;
    let id = req.params.id;

    const productId = id;

    // const productdetails = await Product.find({ _id: id });
    const quantity = 1;
    const data = await User.find({ email: useremail });
    const userid = data[0]._id;
    // console.log("user id is =>", data[0]._id);
    const cartuser = await cartCollection.find({ user: data[0]._id });
    console.log("cart user is =>", cartuser);
    if (!cartuser || cartuser.length === 0) {
      console.log("not cart user ");
      const newItem = {
        product: productId,
        quantity: quantity,
      };
      const newCart = new cartCollection({
        user: data[0]._id,
        items: [newItem],
        total: quantity,
      });
      await newCart.save();

      const cart = await cartCollection.findOne({ user: userid });
      const cartItems = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          const cartItemWithDetails = {
            product,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
          cartItems.push(cartItemWithDetails);
        }
      }
      const isAuthenticated = true;
      // res.render("user/shopcart", { isAuthenticated, cartItems });
      res.redirect("/userhome")
    } else {
      const existingUser = await cartCollection.find({});
      const cartuser = await cartCollection.find({
        user: existingUser[0].user,
      });

      const newItem = {
        product: productId,
        quantity: quantity,
      };
      await cartCollection.updateOne(
        { user: existingUser[0].user },
        { $push: { items: newItem }, $inc: { total: quantity } }
      );
      const cart = await cartCollection.findOne({ user: userid });
      const cartItems = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          const cartItemWithDetails = {
            product,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
          cartItems.push(cartItemWithDetails);
        }
      }
      const isAuthenticated = true;
      // res.render("user/home", { isAuthenticated, cartItems });
      res.redirect("/userhome")
    }
  } else {
    const isAuthenticated = false;
    res.render("user/login", { isAuthenticated });
  }
};

const addtocartfromshop=async(req,res)=>{
  if (req.session.user) {
    let useremail = req.session.user.email;
    let id = req.params.id;

    const productId = id;

    // const productdetails = await Product.find({ _id: id });
    const quantity = 1;
    const data = await User.find({ email: useremail });
    const userid = data[0]._id;
    // console.log("user id is =>", data[0]._id);
    const cartuser = await cartCollection.find({ user: data[0]._id });
    console.log("cart user is =>", cartuser);
    if (!cartuser || cartuser.length === 0) {
      console.log("not cart user ");
      const newItem = {
        product: productId,
        quantity: quantity,
      };
      const newCart = new cartCollection({
        user: data[0]._id,
        items: [newItem],
        total: quantity,
      });
      await newCart.save();

      const cart = await cartCollection.findOne({ user: userid });
      const cartItems = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          const cartItemWithDetails = {
            product,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
          cartItems.push(cartItemWithDetails);
        }
      }
      const isAuthenticated = true;
      // res.render("user/shopcart", { isAuthenticated, cartItems });
      res.redirect("/shop")
    } else {
      const existingUser = await cartCollection.find({});
      const cartuser = await cartCollection.find({
        user: existingUser[0].user,
      });

      const newItem = {
        product: productId,
        quantity: quantity,
      };
      await cartCollection.updateOne(
        { user: existingUser[0].user },
        { $push: { items: newItem }, $inc: { total: quantity } }
      );
      const cart = await cartCollection.findOne({ user: userid });
      const cartItems = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          const cartItemWithDetails = {
            product,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
          cartItems.push(cartItemWithDetails);
        }
      }
      const isAuthenticated = true;
      // res.render("user/home", { isAuthenticated, cartItems });
      res.redirect("/shop")
    }
  } else {
    const isAuthenticated = false;
    res.render("user/login", { isAuthenticated });
  }

}
const productCategory = async (req, res) => {
  const id = req.params.id;
  if (req.session.user) {
    const isAuthenticated = true;
    const categorydata = await category.find();
    const products = await Product.find({ category: id });
    res.render("user/shop.ejs", { products, categorydata, isAuthenticated });
  } else {
    const isAuthenticated = false;
    const categorydata = await category.find();
    const products = await Product.find({ category: id, status: "unblocked" });
    res.render("user/shop.ejs", { products, categorydata, isAuthenticated });
  }
};
const useraccount = async (req, res) => {
  if (req.session.user) {
    const email = await User.find({ email: req.session.user.email });
    const user_id = email[0]._id;

    console.log(user_id);
    const userData = await User.findOne({ _id: user_id }).populate("addresses");

    const isAuthenticated = true;
    res.render("user/page-account.ejs", {
      username,
      isAuthenticated,
      userData,
    });
  } else {
    const isAuthenticated = false;
    res.render("user/page-account.ejs", { username, isAuthenticated });
  }
};
const addtowishlist = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/wishlist.ejs", { isAuthenticated });
  } else {
    isAuthenticated = false;
    res.render("user/wishlist.ejs", { isAuthenticated });
  }
};
const productsearch = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    const name = req.body.search;
    const regex = new RegExp(`^${name}`, "i");
    const products = await Product.find({ name: { $regex: regex } }).exec();
    res.render("user/home", { products, isAuthenticated });
  } else {
    const isAuthenticated = false;
    const name = req.body.search;
    const regex = new RegExp(`^${name}`, "i");
    const products = await Product.find({ name: { $regex: regex } }).exec();
    res.render("user/home", { products, isAuthenticated });
  }
};
const aboutpage = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/aboutpage", { isAuthenticated });
  } else {
    const isAuthenticated = false;
    res.render("user/aboutpage", { isAuthenticated });
  }
};
const showwishlist = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/wishlist.ejs", { isAuthenticated });
  } else {
    isAuthenticated = false;
    res.render("user/wishlist.ejs", { isAuthenticated });
  }
};
const showcart = async (req, res) => {
  try {
    if (req.session.user) {
      console.log("show cart get called==>");
      const userdata = await User.find({ email: req.session.user.email });
      const userid = userdata[0]._id;
      const cart = await cartCollection.findOne({ user: userid });

      if (!cart) {
        throw new Error("Cart not found for this user.");
      }

      const cartItems = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.product);
        if (product) {
          const cartItemWithDetails = {
            product,
            quantity: cartItem.quantity,
            _id: cartItem._id,
          };
          cartItems.push(cartItemWithDetails);
        }
      }

      console.log("cart items with details are===>", cartItems);
      const isAuthenticated = true;
      res.render("user/shopcart", { cartItems, isAuthenticated });
    } else {
      const isAuthenticated = false;
      res.render("user/shopcart", { isAuthenticated });
    }
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    res.status(500).send("Error fetching cart items.");
  }
};

const cartadd = async (req, res) => {
  const data = req.body;

  console.log("data in the body is =>", data);

  try {
    const { email } = req.session.user;
    const { quantity } = req.body;
    const productId = prodId;

    const user = await User.findOne({ email });
    console.log("user is =>", user);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const existingCart = await cartCollection.findOne({ user: user._id });

    if (!existingCart) {
      // If user doesn't have a cart, create a new one
      const newItem = {
        product: productId,
        quantity: quantity,
      };

      const newCart = new cartCollection({
        user: user._id,
        items: [newItem],
        total: quantity,
      });

      await newCart.save();
      res.json({ redirectUrl: "/show_cart" });
    } else {
      // If user already has a cart, update it
      const newItem = {
        product: productId,
        quantity: quantity,
      };

      await cartCollection.updateOne(
        { user: user._id },
        { $push: { items: newItem }, $inc: { total: quantity } }
      );
      res.json({ redirectUrl: "/show_cart" });
    }

    // const isAuthenticated = true;
    // res.render("user/cart.ejs", { isAuthenticated });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const fromcartToLogin = async (req, res) => {
  const isAuthenticated = false;
  res.render("user/login.ejs", { isAuthenticated });
};
const userInCart = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/cart", { isAuthenticated });
};
const loginpage1 = async (req, res) => {
  res.render("user/login");
};
const cartproductdelete = async (req, res) => {
  const id = req.params.id;
  const userdata = await User.find({ email: req.session.user.email });
  const userid = userdata[0]._id;
  console.log("userid is ===>", userid);
  console.log("param id ===>", id);

  await cartCollection.updateOne(
    {
      user: userid,
    },
    {
      $pull: { items: { _id: id } },
    }
  );

  const cart = await cartCollection.findOne({ user: userid });
  const cartItems = [];

  for (const cartItem of cart.items) {
    const product = await Product.findById(cartItem.product);
    if (product) {
      const cartItemWithDetails = {
        product,
        quantity: cartItem.quantity,
        _id: cartItem._id,
      };
      cartItems.push(cartItemWithDetails);
    }
  }
  console.log("cart items for deletion are ====> ", cartItems);
  const isAuthenticated = true;
  res.render("user/shopcart", { isAuthenticated, cartItems });
};
const checkoutpage = async (req, res) => {
  if (req.session.user) {
    let isAuthenticated = true;
    res.render("user/checkout", { isAuthenticated });
  } else {
    let isAuthenticated = false;
    res.render("user/checkout", { isAuthenticated });
  }
};
const gotoshopcart = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/shopcart", { isAuthenticated });
};
const editaddress = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/address", { isAuthenticated });
};
const addAddress=async(req,res)=>{
  const isAuthenticated=true
  res.render("user/address.ejs",{isAuthenticated})
}
const user_address = async (req, res) => {
  const {
    name,
    city,
    state,
    address,
    pincode,
    landmark,
    mobile,
    alt_mobile,
    type,
  } = req.body;

  useremail = req.session.user.email;
  const userdata = await User.find({ email: useremail });
  const id = userdata[0]._id;
  const userId = id;

  const Address = new addressSchema({
    userId: id,
    name,
    city,
    state,
    address,
    pincode,
    landmark,
    mobile,
    alt_mobile,
    userId,
    type,
    blocked: false,
  });
  const savedAddress = await Address.save();
  await User.findByIdAndUpdate(userId, { $push: { addresses: Address._id } });
  res.redirect("/useraccount");
};

const editaddress_id = async (req, res) => {
  
  const id = req.params.id;
  console.log(typeof(id))
  const d=id.trim()
  console.log("id is ===>",d);

  const details=await addressSchema.find({_id:d})
  const isAuthenticated=true;

  res.render("user/editaddress",{isAuthenticated,details})

  
 
 
};
const updatedAddress=async(req,res)=>{
  const id = req.params.id;
  const {
    name,
    city,
    state,
    address,
    pincode,
    landmark,
    mobile,
    alt_mobile,
    type,
  } = req.body;
  
  try {
    // Construct the update object with the fields you want to update
    const updateFields = {
      name,
      city,
      state,
      address,
      pincode,
      landmark,
      mobile,
      alt_mobile,
      type,
    };
  
    // Use findByIdAndUpdate to update the document
    const updatedAddress = await addressSchema.findByIdAndUpdate(id, updateFields, { new: true });
  
    if (!updatedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
  
    // res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
}
const deleteaddress = async (req, res) => {
  const dd = req.params.id;
  const id=dd.trim()
  const userData =await addressSchema.find({_id:id})

  try {
    const deletedAddress = await addressSchema.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    const isAuthenticated=true;

   res.render("user/page-account",{isAuthenticated,userData })
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  deleteaddress
};


module.exports = {
  productsearch,
  addtowishlist,
  useraccount,
  productCategory,
  addtocart,
  shop,
  userhome,
  productpage,
  userlogout,
  userlogin,
  signin,
  registerpage,
  loginpage,
  verify_otp,
  regenerateOtp,
  user_registration,
  aboutpage,
  showwishlist,
  showcart,
  cartadd,
  fromcartToLogin,
  userInCart,
  loginpage1,
  checkoutpage,
  cartproductdelete,
  gotoshopcart,
  editaddress,
  addAddress,
  user_address,
  editaddress_id,
  updatedAddress,
  deleteaddress,
  addtocartfromshop
};
