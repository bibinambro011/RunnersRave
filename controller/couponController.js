const Coupon = require('../model/couponSchema');
const UsedCoupon = require('../model/useCouponSchema'); 

const AddCoupons=async(req,res)=>{
    res.render("admin/addCouponpage")
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
module.exports={AddCoupons,createCoupon}