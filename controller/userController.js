const Product = require("../model/productSchema");
const addressSchema = require("../model/addresses");
const User = require("../model/userSchema");
const category = require("../model/categorySchema");
const cartCollection = require("../model/cartSchema");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const { userexist } = require("../middleware/userAuth");
const { json } = require("express/lib/response");
const Order = require("../model/orderSchema");
require("dotenv").config();

const accountSid = process.env.accountSid;
const authToken = process.env.authToken;

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
    phone: req.body.phone,
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
    console.log("session details===>", req.session.user);
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

  const data = await User.find({ email: req.body.email });

  try {
    let user = await User.findOne({ email: userdata.email });
    if (user.status == false) {
      const isAuthenticated = false;
      const data = "you are blocked";
      return res.render("user/login", { errordata: data, isAuthenticated });
    }

    if (user) {
      const isPasswordValid = await bcrypt.compare(
        userdata.password,
        user.password
      );

      if (isPasswordValid) {
        req.session.user = data;

        return res.redirect("/userhome");
      } else {
        const isAuthenticated = false;
        res.render("user/login.ejs", {
          errordata: "Invalid credentials",
          isAuthenticated,
        });
      }
    } else {
      const isAuthenticated = false;
      return res.render("user/login.ejs", {
        errordata: "Invalid credentials",
        isAuthenticated,
      });
    }
  } catch (error) {
    console.error("Error during login:", error);
    const isAuthenticated = false;
    return res.status(500).send("Internal Server Error");
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

const ITEM_PER_PAGE = 6; // Number of products to display per page

const userhome = async (req, res) => {
  const user = req.session.user;
  const page = parseInt(req.query.page) || 1; // Get the requested page number

  try {
    if (user) {
      const userid = req.session.user[0]._id;
      const cart = await cartCollection.find({ userId: userid });
      const isAuthenticated = true;
      const skip = (page - 1) * ITEM_PER_PAGE; // Calculate the number of items to skip
      const products = await Product.find({ status: "unblocked" })
        .skip(skip)
        .limit(ITEM_PER_PAGE);

      // Count total products for calculating total pages
      const totalProductsCount = await Product.countDocuments({
        status: "unblocked",
      });
      const totalPages = Math.ceil(totalProductsCount / ITEM_PER_PAGE);

      res.render("user/home.ejs", {
        products,
        isAuthenticated,
        currentPage: page,
        totalPages,
      });
    } else {
      const isAuthenticated = false;
      const skip = (page - 1) * ITEM_PER_PAGE; // Calculate the number of items to skip
      const products = await Product.find({ status: "unblocked" })
        .skip(skip)
        .limit(ITEM_PER_PAGE);

      // Count total products for calculating total pages
      const totalProductsCount = await Product.countDocuments({
        status: "unblocked",
      });
      const totalPages = Math.ceil(totalProductsCount / ITEM_PER_PAGE);

      res.render("user/home.ejs", {
        products,
        isAuthenticated,
        currentPage: page,
        totalPages,
      });
    }
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
};

const ITEMS_PER_PAGE = 6; // Number of products to display per page

const shop = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the requested page number

  try {
    const isAuthenticated = req.session.user ? true : false;
    const categorydata = await category.find();

    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
    const products = await Product.find({ status: "unblocked" })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    // Count total products for calculating total pages
    const totalProductsCount = await Product.countDocuments({
      status: "unblocked",
    });
    const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

    res.render("user/shop.ejs", {
      products,
      categorydata,
      isAuthenticated,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
};

// Number of products to display per page

const productCategory = async (req, res) => {
  const id = req.params.id;
  const page = parseInt(req.query.page) || 1; // Get the requested page number

  try {
    const isAuthenticated = req.session.user ? true : false;
    const categorydata = await category.find();
    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

    let products;
    if (req.session.user) {
      products = await Product.find({ category: id })
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
    } else {
      products = await Product.find({ category: id, status: "unblocked" })
        .skip(skip)
        .limit(ITEMS_PER_PAGE);
    }

    // Count total products for calculating total pages
    const totalProductsCount = await Product.countDocuments({ category: id });
    const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

    res.render("user/shop.ejs", {
      products,
      categorydata,
      isAuthenticated,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
};

// Number of products to display per page

const productBrand = async (req, res) => {
  const brand = req.query.brand;
  const page = parseInt(req.query.page) || 1; // Get the requested page number

  try {
    const isAuthenticated = true;
    const categorydata = await category.find();
    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip

    const products = await Product.find({ brand: brand })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    // Count total products for calculating total pages
    const totalProductsCount = await Product.countDocuments({ brand: brand });
    const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

    res.render("user/shop.ejs", {
      products,
      categorydata,
      isAuthenticated,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Error fetching products.");
  }
};

const useraccount = async (req, res) => {
  if (req.session.user) {
    const user_id = req.session.user[0]._id;
    const data = await User.findById(user_id);

    const username = data.username;
    const userData = await User.findOne({ _id: user_id }).populate("addresses");

    // Find the order details for the user
    const details = await Order.find({ userId: user_id });
    const userdetail = await User.findById(user_id);
    // Find the cart details for the user
    const order = await Order.find({ userId: user_id }).populate({
      path: "products.productId", // Populate the 'productId' field
      model: "productCollection", // Replace with the correct model name for products
    });
    const orders = order;

    const isAuthenticated = true;
    res.render("user/page-account.ejs", {
      username,
      isAuthenticated,
      userData,
      data,
      order,

      userdetail,
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
const profileafteredit = async (req, res) => {
  console.log(req.body);
  const userId = req.session.user[0]._id;
  const { username, email, phone } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId }, // Replace userId with the actual user ID
    { $set: { username, email, phone } },
    { new: true } // This option ensures that the updated user is returned
  );
  res.redirect("/useraccount");
};
const passwordchange = async (req, res) => {
  const user = await User.findById(req.session.user[0]._id);
  const { currentpassword, newpassword, confirmpassword } = req.body;
  const isMatch = await bcrypt.compare(currentpassword, user.password);
  if (isMatch) {
    const hashedPassword = await bcrypt.hash(newpassword, 10); // You can adjust the salt rounds as needed
    user.password = hashedPassword;
    await user.save();
    res.redirect("/useraccount");
  } else {
    res.render("user/changepasswordpage", {
      message: "your entered current password do not match",
      isAuthenticated: true,
    });
  }
};
// Number of products to display per page

const productsearch = async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Get the requested page number
  const name = req.body.search;
  const regex = new RegExp(`^${name}`, "i");

  try {
    const isAuthenticated = req.session.user ? true : false;
    const skip = (page - 1) * ITEMS_PER_PAGE; // Calculate the number of items to skip
    const products = await Product.find({ name: { $regex: regex } })
      .skip(skip)
      .limit(ITEMS_PER_PAGE);

    // Count total products for calculating total pages
    const totalProductsCount = await Product.countDocuments({
      name: { $regex: regex },
    });
    const totalPages = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);

    res.render("user/home", {
      products,
      isAuthenticated,
      currentPage: page,
      totalPages,
    });
  } catch (error) {
    res.status(500).send("Error fetching products.");
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

const loginpage1 = async (req, res) => {
  res.render("user/login");
};

const cartRedirection = async (req, res) => {
  const isAuthenticated = true;

  const products = await Product.find({ status: "unblocked" });
  res.render("user/home", { products, isAuthenticated });
};

const editaddress = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/address", { isAuthenticated });
};
const addAddress = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/address.ejs", { isAuthenticated });
};
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
  const id = req.session.user[0]._id;
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
  console.log(typeof id);
  const d = id.trim();
  console.log("id is ===>", d);

  const details = await addressSchema.find({ _id: d });
  console.log(details);
  const isAuthenticated = true;

  res.render("user/editaddress", { isAuthenticated, details });
};
const updatedAddress = async (req, res) => {
  console.log("hello world");
  console.log(req.body);
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
  console.log("type is ===>", type);

  try {
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

    const updatedAddress = await addressSchema.findByIdAndUpdate(
      id,
      updateFields,
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    res.redirect("/useraccount");
  } catch (error) {
    console.error("Error updating address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const deleteaddress = async (req, res) => {
  const dd = req.params.id;
  const id = dd.trim();
  const userData = await addressSchema.find({ _id: id });

  try {
    const deletedAddress = await addressSchema.findByIdAndDelete(id);

    if (!deletedAddress) {
      return res.status(404).json({ message: "Address not found" });
    }
    const isAuthenticated = true;

    res.redirect("/useraccount");
  } catch (error) {
    console.error("Error deleting address:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const paymentsuccesfull = async (req, res) => {
  const isAuthenticated = true;
  res.render("user/paymentmessage", { isAuthenticated });
};
const changepasswordpage = async (req, res) => {
  res.render("user/changepasswordpage", { isAuthenticated: true });
};

module.exports = {
  deleteaddress,
};

module.exports = {
  productsearch,
  addtowishlist,
  useraccount,
  productCategory,
  // addtocart,
  profileafteredit,
  passwordchange,
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
  // showcart,
  // cartadd,
  // fromcartToLogin,
  // userInCart,
  loginpage1,
  //checkoutpage,
  cartRedirection,
  // cartproductdelete,
  // gotoshopcart,
  editaddress,
  addAddress,
  user_address,
  editaddress_id,
  updatedAddress,
  deleteaddress,
  // addtocartfromshop,
  paymentsuccesfull,
  productBrand,
  changepasswordpage,
};
