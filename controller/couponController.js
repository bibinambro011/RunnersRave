const Coupon = require('../model/couponSchema');
const UsedCoupon = require('../model/useCouponSchema'); 
const Cart=require("../model/cartSchema")


const AddCoupons=async(req,res)=>{
    const allCoupon=await Coupon.find();
res.render("admin/addCouponpage",{allCoupon})
}
const createCoupon=async(req,res)=>{
   const {couponcode,coupondescription,minorder,maxdiscount,validfrom,validto}=req.body;
   const couponData = new Coupon({
    couponCode:couponcode,
    couponDiscription:coupondescription,
    discountPercentage:maxdiscount,
    minOrderAmount:minorder,
    validFor:validto,
    createdOn:validfrom,
 });
 console.log('Coupon Data is : ',couponData);
 const addedCoupon = await couponData.save();
 res.redirect("/admin/AddCoupons")
}
const coupontemplate=async(req,res)=>{
    const allCoupon=await Coupon.find({isActive:true});
    
    res.render("user/coupontemp",{allCoupon,isAuthenticated:true})
}
const applyCoupon = async (req, res) => {
  const userId = req.session.user[0]._id;
  const cart = await Cart.findOne({ userId: userId }).populate({
    path: 'products.productId',
    model: 'productCollection',
  });
  let totalPrice = 0;

  if (cart && cart.products.length > 0) {
    cart.products.forEach((product) => {
      const quantity = product.quantity;
      const price = product.productId.selling_price;
      const productTotal = quantity * price;
      totalPrice += productTotal;
    });

  // Get the coupon code from the form
  const { Couponcode } = req.body;

  // Find the coupon in your database
  const appliedCoupon = await Coupon.findOne({ couponCode: Couponcode });

  let discountAmount = "";
  let originaltotal = "";

  if (appliedCoupon) {
    if (appliedCoupon.redeemedusers.includes(userId)) {
      // Handle the case where the coupon has already been redeemed by the user
      res.render('user/placeOrder', {
        isAuthenticated: true,
        cart,
        carttototal: totalPrice, // Make sure to calculate totalPrice
      
        discountAmount: 0,
        originaltotal:totalPrice,
        code: Couponcode,
        error: 'Coupon already used by this user', // Add an error message
      });
    }else{
     
  
        discountAmount = (totalPrice * appliedCoupon.discountPercentage) / 100;
        originaltotal = totalPrice;
        totalPrice -= discountAmount;
  
        // Add the userId to the redeemedusers array
     
      }
  
      // Update the cart total in your database or session
      // You should store the updated total in a session or database to keep it persistent
  
      // Render the updated total on the page
      const isAuthenticated = true;
      const CouponList = await Coupon.find();
      res.render('user/placeOrder', {
        isAuthenticated,
        cart,
        carttototal: totalPrice,
        Coupon: CouponList,
        discountAmount: discountAmount,
        originaltotal,
        code: Couponcode,
      });
    }
    // Calculate the discount and deduct it from the total amount
   
  } else {
    // Handle the case where the coupon code is not valid
    res.redirect('/placeOrder'); // Redirect to an error page or the same page with an error message
  }
}

const couponedit=async(req,res)=>{
  let data=req.params.id;
  console.log("coupon id is==>",data)
  const details=await Coupon.findById(data);
  console.log(details);
  res.render("admin/couponupdate",{details})
}

const couponupdate=async(req,res)=>{
  const { couponcode, coupondescription, minorder, maxdiscount, validfrom, validto } = req.body;
  const id = req.params.id;
  
  // Create an object with the fields you want to update
  const updateData = {
      couponCode: couponcode,
      couponDiscription: coupondescription,
      minOrderAmount: minorder,
      discountPercentage: maxdiscount,
      createdOn: validfrom,
      validFor: validto
  };
  
  try {
      // Use findByIdAndUpdate to update the document by ID
      const updatedData = await Coupon.findByIdAndUpdate(id, updateData, { new: true });
  
      // The { new: true } option returns the updated document
      if (!updatedData) {
          // Handle the case where no document was found with the given ID
          return res.status(404).json({ message: "Coupon not found" });
      }
  
      // Handle the successful update
      // return res.status(200).json({ message: "Coupon updated successfully", data: updatedData });
      return res.redirect("/admin/AddCoupons")
  } catch (error) {
      // Handle any errors that may occur during the update process
      return res.status(500).json({ error: error.message });
  }
  
}
const deactivateCoupon=async(req,res)=>{
  const id=req.params.id;
  const updData={
    isActive:false
  }
  const Data = await Coupon.findByIdAndUpdate(id,updData , { new: true });
  return res.redirect("/admin/AddCoupons")
}
const activateCoupon=async(req,res)=>{
  const id=req.params.id;
  const updData={
    isActive:true
  }
  const Data = await Coupon.findByIdAndUpdate(id,updData , { new: true });
  return res.redirect("/admin/AddCoupons")
}
module.exports={AddCoupons,createCoupon,coupontemplate,applyCoupon,couponedit,couponupdate,deactivateCoupon,activateCoupon}