const express = require("express");
const router = express.Router();
const middleware = require("../middleware/userAuth");
const controller = require("../controller/userController");
const couponController = require("../controller/couponController");
const cartController = require("../controller/cartController");
const walletController = require("../controller/walletController");
const orderController = require("../controller/orderController");
const nocache = require("nocache");

router.use(nocache());
//user login
router.get("/", middleware.userblock, middleware.islogin, controller.userhome);
router.get("/userhome", controller.userhome);
router.get("/signup", controller.registerpage);
router.get("/login", middleware.userexist, controller.loginpage);
router.post("/user_registration", controller.user_registration);

router.get("/forgotpassword", controller.forgotpassword);
router.post("/forgetpasswordotp", controller.forgetpasswordotp);
router.post("/reset_password", controller.resetPassword);

router.post("/login", middleware.userexist, controller.userlogin);
router.get("/logout", middleware.islogout, controller.userlogout);
router.get(
  "/useraccount",
  middleware.userblock,
  middleware.islogin,
  controller.useraccount
);

//product
router.get("/shop", middleware.userblock, controller.shop);
router.get(
  "/productCategory/:id",
  middleware.userblock,
  controller.productCategory
);
router.get("/productBrand", middleware.userblock, controller.productBrand);
router.get("/priceLowToHigh", middleware.userblock, controller.priceLowToHigh);
router.get("/priceHighToLow", middleware.userblock, controller.priceHighToLow);
router.post("/productsearch", middleware.userblock, controller.productsearch);
router.get("/productsearch", middleware.userblock, controller.productsearch);
router.get("/aboutpage", middleware.userblock, controller.aboutpage);
router.get("/product/:id", middleware.userblock, controller.productpage);

//wishlist
router.get(
  "/show_wishlist",
  middleware.userblock,
  middleware.cartAuth,
  controller.showwishlist
);
router.get(
  "/deletewishlist/:id",
  middleware.userblock,
  controller.deletewishlist
);
router.get(
  "/addtowishlist/:id",
  middleware.userblock,
  middleware.cartAuth,
  controller.addtowishlist
);
router.get(
  "/fromwishlisttocart/:id",
  middleware.userblock,
  controller.fromwishlisttocart
);

//cart
router.get(
  "/show_cart",
  middleware.userblock,
  middleware.cartAuth,
  cartController.showcart
);
router.post(
  "/cartUpdate",
  middleware.userblock,
  middleware.islogin,
  cartController.cartUpdate
);

router.post(
  "/addtocart/:id",
  middleware.userblock,
  middleware.cartislogin,
  cartController.addtocartfrompage
);

router.get(
  "/cartproductdelete/:id",
  middleware.userblock,
  middleware.islogin,
  cartController.cartproductdelete
);
router.get("/cartRedirection",middleware.userblock, middleware.islogin, controller.cartRedirection);
router.get("/addtocart/:id",middleware.userblock, middleware.islogin, cartController.addtocart);

//address

router.get("/editaddress",middleware.userblock, controller.editaddress);
router.get("/editaddress/:id",middleware.userblock, middleware.islogin, controller.editaddress_id);
router.post("/user_address",middleware.userblock, middleware.islogin, controller.user_address);
router.get("/addAddress",middleware.userblock, middleware.islogin, controller.addAddress);
router.post(
  "/updatedAddress/:id",
  middleware.userblock,
  middleware.islogin,
  controller.updatedAddress
);
router.get("/deleteaddress/:id",middleware.userblock, middleware.islogin, controller.deleteaddress);
router.post(
  "/profileafteredit",
  middleware.userblock,
  middleware.islogin,
  controller.profileafteredit
);

//payment

router.get("/checkoutpage",middleware.userblock, middleware.islogin, cartController.checkoutpage);
router.get(
  "/paymentsuccesfull",
  middleware.userblock,
  middleware.islogin,
  controller.paymentsuccesfull
);
router.post(
  "/verify-payment",
  middleware.userblock,
  middleware.islogin,
  orderController.verifyOnlinePayment
);
router.post("/paymentFailureHandler",middleware.userblock, orderController.paymentFailureHandler);
router.get(
  "/paymentFailure",
  middleware.userblock,
  middleware.islogin,
  orderController.paymentFailure
);

//orders

router.post("/orderdetails",middleware.userblock, middleware.islogin, orderController.orderdetails);
router.post(
  "/cancel-order/:orderId",
  middleware.userblock,
  middleware.islogin,
  orderController.cancelOrder
);

router.get(
  "/orderplacedsuccessfully",
  middleware.userblock,
  middleware.islogin,
  orderController.orderplacedsuccessfully
);
router.get(
  "/showUserOrder/:id",
  middleware.userblock,
  middleware.islogin,
  orderController.showUserOrder
);

router.get("/regenerateotp", controller.regenerateOtp);

router.get("/addtocart/:id", middleware.islogin, cartController.addtocart);

router.post(
  "/orderUpdatedStatusDetails/:id",
  middleware.userblock,
  middleware.islogin,
  orderController.orderUpdatedStatusDetails
);
router.get("/placeorder",middleware.userblock, middleware.islogin, cartController.placeorder);

//password change
router.get(
  "/changepasswordpage",
  middleware.userblock,
  middleware.islogin,
  controller.changepasswordpage
);
router.post("/passwordchange", middleware.islogin, controller.passwordchange);
router.get("/regenerateotp", controller.regenerateOtp);
router.get("/forgotpassword", controller.forgotpassword);
router.post("/forgetpasswordotp", controller.forgetpasswordotp);
router.post("/reset_password", controller.resetPassword);
router.get("/verifyotp", controller.verify_otp);

//coupons
router.get(
  "/coupontemplate",
  middleware.userblock,
  middleware.islogin,
  couponController.coupontemplate
);
router.post("/applyCoupon",middleware.userblock, middleware.islogin, couponController.applyCoupon);

//wallet
router.get("/wallet",middleware.userblock, middleware.islogin, walletController.userwallet);
router.get(
  "/lowWalletbalance",
  middleware.userblock,
  middleware.islogin,
  walletController.lowWalletbalance
);
router.get(
  "/successWalletpayment",
  middleware.userblock,
  middleware.islogin,
  walletController.successWalletpayment
);

module.exports = router;
