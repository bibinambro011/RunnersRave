const express = require("express");
const router = express.Router();
const middleware = require("../middleware/userAuth");
const controller = require("../controller/userController");

router.get("/",middleware.userexist,controller.userhome );
router.get("/userhome",middleware.userexist,controller.userhome)
router.get("/signup", controller.registerpage);
router.get("/login",middleware.userexist, controller.loginpage);
router.post("/login",middleware.userexist, controller.userlogin);
router.get("/logout", middleware.islogout, controller.userlogout);
router.post("/user_registration", controller.user_registration);
router.get("/shop",controller.shop);
router.get("/product/:id",controller.productpage);
router.get("/addtocart",middleware.cartAuth,controller.addtocart)
router.get("/verifyotp", controller.verify_otp);
router.get("/productCategory/:id",controller.productCategory);
router.get("/useraccount",middleware.islogin,controller.useraccount);
router.get("/addtowishlist",middleware.cartAuth,controller.addtowishlist);
router.post("/productsearch",controller.productsearch);
router.get("/aboutpage",controller.aboutpage);
router.get("/show_wishlist",middleware.cartAuth,controller.showwishlist);
router.get("/show_cart",middleware.cartAuth,controller.showcart);


router.get("/regenerateotp", controller.regenerateOtp);


module.exports = router;
