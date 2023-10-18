const express = require("express");
const router = express.Router();
const middleware = require("../middleware/userAuth");
const controller = require("../controller/userController");

const cartController = require("../controller/cartController");
const orderController = require("../controller/orderController");
const nocache = require("nocache");

router.use(nocache());

router.get("/", middleware.islogin, controller.userhome);
router.get("/userhome",  controller.userhome);
router.get("/signup", controller.registerpage);
router.get("/login", middleware.userexist, controller.loginpage);
router.post("/login", middleware.userexist, controller.userlogin);
router.get("/logout", middleware.islogout, controller.userlogout);
router.post("/user_registration", controller.user_registration);
router.get("/shop", controller.shop);
router.get("/product/:id", controller.productpage);
router.get("/placeorder", middleware.islogin, cartController.placeorder);

router.post(
  "/addtocart/:id",
  middleware.cartislogin,
  cartController.addtocartfrompage
);
router.get("/verifyotp", controller.verify_otp);
router.get("/productCategory/:id", controller.productCategory);
router.get("/productBrand",controller.productBrand)
router.get("/useraccount", middleware.islogin, controller.useraccount);
router.get("/addtowishlist", middleware.cartAuth, controller.addtowishlist);
router.post("/productsearch", controller.productsearch);
router.get("/aboutpage", controller.aboutpage);
router.get("/show_wishlist", middleware.cartAuth, controller.showwishlist);
router.get("/show_cart", middleware.cartAuth, cartController.showcart);
router.post("/cartUpdate", middleware.islogin, cartController.cartUpdate);
// router.get("/fromcartToLogin",middleware.cartAuth,controller.fromcartToLogin);
// router.get("/userInCart",middleware.cartAuth,controller.userInCart);
router.get(
  "/cartproductdelete/:id",
  middleware.islogin,
  cartController.cartproductdelete
);
// router.get("/gotoshopcart",middleware.islogin,controller.gotoshopcart)
router.get("/checkoutpage", middleware.islogin, cartController.checkoutpage);
router.get("/editaddress", controller.editaddress);
router.get("/editaddress/:id", middleware.islogin, controller.editaddress_id);
router.post("/user_address", middleware.islogin, controller.user_address);
router.get("/addAddress", middleware.islogin, controller.addAddress);
router.post(
  "/updatedAddress/:id",
  middleware.islogin,
  controller.updatedAddress
);
router.get("/deleteaddress/:id", middleware.islogin, controller.deleteaddress);
router.post(
  "/profileafteredit",
  middleware.islogin,
  controller.profileafteredit
);
router.get(
  "/paymentsuccesfull",
  middleware.islogin,
  controller.paymentsuccesfull
);
router.post("/verify-payment",middleware.islogin,orderController.verifyOnlinePayment);
router.post("/paymentFailureHandler",orderController.paymentFailureHandler)
router.get("/paymentFailure",middleware.islogin,orderController.paymentFailure)
router.get("/cartRedirection", middleware.islogin, controller.cartRedirection);
router.post("/orderdetails", middleware.islogin, orderController.orderdetails);
router.post("/passwordchange", middleware.islogin, controller.passwordchange);
router.post(
  "/cancel-order/:orderId",
  middleware.islogin,
  orderController.cancelOrder
);

router.get(
  "/orderplacedsuccessfully",
  middleware.islogin,
  orderController.orderplacedsuccessfully
);
router.get(
  "/showUserOrder/:id",
  middleware.islogin,
  orderController.showUserOrder
);

router.get("/regenerateotp", controller.regenerateOtp);

router.get("/addtocart/:id", middleware.islogin, cartController.addtocart);

router.post(
  "/orderUpdatedStatusDetails/:id",
  middleware.islogin,
  orderController.orderUpdatedStatusDetails
);
router.get("/changepasswordpage",middleware.islogin,controller.changepasswordpage)
module.exports = router;
