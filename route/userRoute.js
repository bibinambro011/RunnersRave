const express = require("express");
const router = express.Router();
const middleware = require("../middleware/userAuth");
const controller = require("../controller/userController");
const nocache = require("nocache");

router.use(nocache());

router.get("/", middleware.userexist, controller.userhome);
router.get("/userhome", middleware.userexist, controller.userhome);
router.get("/signup", controller.registerpage);
router.get("/login", middleware.userexist, controller.loginpage);
router.post("/login", middleware.userexist, controller.userlogin);
router.get("/logout", middleware.islogout, controller.userlogout);
router.post("/user_registration", controller.user_registration);
router.get("/shop", controller.shop);
router.get("/product/:id", controller.productpage);
router.get("/addtocart/:id", middleware.cartAuth, controller.addtocart);
router.get("/addtocartfromshop/:id",middleware.islogin,controller.addtocartfromshop)
router.post("/addtocart/:id",middleware.cartislogin,controller.cartadd)
router.get("/verifyotp", controller.verify_otp);
router.get("/productCategory/:id", controller.productCategory);
router.get("/useraccount", middleware.islogin, controller.useraccount);
router.get("/addtowishlist", middleware.cartAuth, controller.addtowishlist);
router.post("/productsearch", controller.productsearch);
router.get("/aboutpage", controller.aboutpage);
router.get("/show_wishlist", middleware.cartAuth, controller.showwishlist);
router.get("/show_cart", middleware.cartAuth, controller.showcart);
router.get("/fromcartToLogin",middleware.cartAuth,controller.fromcartToLogin);
router.get("/userInCart",middleware.cartAuth,controller.userInCart);
 router.get("/cartproductdelete/:id",middleware.islogin,controller.cartproductdelete);
router.get("/gotoshopcart",middleware.islogin,controller.gotoshopcart)
router.get("/checkoutpage",middleware.islogin,controller.checkoutpage);
router.get("/editaddress",controller.editaddress);
router.get("/editaddress/:id",middleware.islogin,controller.editaddress_id)
router.post("/user_address",middleware.islogin,controller.user_address);
router.get("/addAddress",middleware.islogin,controller.addAddress);
router.post("/updatedAddress/:id",middleware.islogin,controller.updatedAddress);
router.get("/deleteaddress/:id",middleware.islogin,controller.deleteaddress)

router.get("/regenerateotp", controller.regenerateOtp);


module.exports = router;
