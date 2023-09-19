const process = require("dotenv").config();
const Product=require("../model/productSchema")
const User=require("../model/userSchema")

const twilio = require("twilio");
const accountSid = "AC7ed272bfc72e23f5ea62dde1140be05b";
const authToken = "58b139fb5d740b49a36f8f967f3c0cc9";

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
exports.user_registration = async (req, res) => {
  data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,

    phone: req.body.phone,
  };

  const recipientPhoneNumber = `+91${data.phone}`;

  // Validate phone number (simple length check)
  if (data.phone.length !== 10) {
    return res.render("login.ejs", { errordata: "Invalid phone number" });
  }

  let otp = generateOtp();

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "(469) 557-2151", // Replace with your Twilio phone number
      to: recipientPhoneNumber,
    });
    setTimeout(() => {
      generatedotp = null;
    }, 30000);
    res.render("otp.ejs", { otp }); // Render the OTP page
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.render("login.ejs", {
      errordata: "Failed to send OTP enter a valid number",
    });
  }
};
exports.regenerateOtp = async (req, res) => {
  const recipientPhoneNumber = `+91${data.phone}`;

  // Validate phone number (simple length check)
  if (data.phone.length !== 10) {
    return res.render("login.ejs", { errordata: "Invalid phone number" });
  }

  let otp = generateOtp();

  try {
    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: "(469) 557-2151", // Replace with your Twilio phone number
      to: recipientPhoneNumber,
    });
    res.render("otp.ejs", { otp }); // Render the OTP page
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.render("login.ejs", {
      errordata: "Failed to send OTP enter a valid number",
    });
  }
};

exports.verify_otp = async (req, res) => {
  const receivedOtp = req.query.otp; // OTP entered by the user
  console.log(receivedOtp, `generated otp ${generatedotp}`);

  // Check if the entered OTP matches the generated OTP
  if (receivedOtp !== generatedotp) {
    return res.render("otp.ejs", { errordata: "Invalid OTP" });
  } else {
    let userdata = await collection.findOne({ email: data.email });
    if (userdata) {
      res.render("login.ejs", { errordata: "email already exist" });
    } else if (!userdata) {
      // console.log(data);
      await collection.insertMany(data);
      res.redirect("/userhome");
    }
  }
};

exports.loginpage = async (req, res) => {
    console.log("haii")
res.render("user/login.ejs");

};

exports.registerpage = async (req, res) => {
  res.render("login.ejs");
};
exports.signin = async (req, res) => {
  res.render("user/login.ejs");
};
exports.userlogin = async (req, res) => {
  const userdata = {
    email: req.body.email,
    password: req.body.password,
  };

  let user = await User.findOne({ email: userdata.email });
  console.log(user);

  if (user) {
    if (user.email == userdata.email && user.password == userdata.password) {
      req.session.user = userdata;
      const products = await Product.find();
      
      res.render("user/home.ejs", { products });
    }
  } else {
    res.redirect("/login", {
      errordata: "provided credentials are wrong",
    });
  }
};
exports.userlogout = async (req, res) => {
  res.redirect("/userloginacc");
};

exports.userhome = async (req, res) => {
  const products = await Product.find();
  res.render("user/home.ejs", { products });
};
exports.userloginacc = async (req, res) => {
  res.redirect("userlogin.ejs");
};
exports.resetpassword = async (req, res) => {
  const data = await collection.findOne({ email: req.body.email });
};
exports.forgotpassword = async (req, res) => {
  res.render("forgotpassword.ejs");
};


// exports.accountpage=async(req,res)=>{
//   res.render("page-account.ejs")
// }
