const process = require("dotenv").config();
const Product = require("../model/productSchema");
const User = require("../model/userSchema");
const category = require("../model/categorySchema");
const bcrypt = require("bcrypt");
const twilio = require("twilio");

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
const productpage = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    const id = req.params.id;
    const product = await Product.findOne({ _id: id });
    res.render("user/productpage.ejs", { product, isAuthenticated });
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
    isAuthenticated = true;
    res.render("user/cart.ejs", { isAuthenticated });
  } else {
    const isAuthenticated = false;
    res.render("user/cart.ejs", { isAuthenticated });
  }
};

const productCategory = async (req, res) => {
  const id = req.params.id;
  if(req.session.user){
    const isAuthenticated=true;
    const categorydata = await category.find();
    const products = await Product.find({ category: id });
  res.render("user/shop.ejs", { products, categorydata,isAuthenticated });
  }else{
    const isAuthenticated=false
    const categorydata = await category.find();
  const products = await Product.find({ category: id,status:"unblocked" });
  res.render("user/shop.ejs", { products, categorydata,isAuthenticated });
  }
  
  
};
const useraccount = async (req, res) => {
  if (req.session.user) {
    const isAuthenticated = true;
    res.render("user/page-account.ejs", { username, isAuthenticated });
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
  res.render("user/shopcart");
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
};
