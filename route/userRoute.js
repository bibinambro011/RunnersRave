const express = require("express");
const router = express.Router();
const middleware = require("../middleware/userAuth");
const controller = require("../controller/userController");

router.get("/",controller.userhome );
router.get("/signup", controller.registerpage);
router.get("/login", controller.loginpage);
router.post("/login", controller.userlogin);
router.get("/logout", middleware.islogout, controller.userlogout);
// router.post("/user_registration", controller.user_registration);
// router.get("/verifyotp", controller.verify_otp);
// router.get("/registeruser", controller.loginpage);
// router.get("/loginpage", controller.loginpage);
// router.get("/signin", controller.signin);
// router.get("/userhome", middleware.islogin, controller.userhome);
// router.post("/resetpassword", controller.resetpassword);
// router.get("/regenerateotp", controller.regenerateOtp);
// router.get("/forgotpassword", controller.forgotpassword);

// router.get("/accountpage",middleware.islogin,controller.accountpage)

module.exports = router;
