const process = require("dotenv").config();
const express = require("express");
const router = express.Router();
const controller = require("../controller/adminController");
const orderController = require("../controller/orderController");
const couponController=require("../controller/couponController")
const middleware = require("../middleware/adminAuth");
const multer = require("multer");
const Product = require("../model/productSchema");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "assets/uploads"); // Save images to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Append a timestamp and file extension
  },
});

const upload = multer({ storage: storage });

router.get("/", middleware.adminexist, controller.login);
router.post("/login", controller.dashboard);
router.get("/home", middleware.islogin, controller.homepage);
router.get("/login", controller.loginpage);
router.get("/productlist", middleware.islogin, controller.productlist);
router.get("/addproducts", middleware.islogin, controller.addproduct);

router.get("/logout", middleware.islogout, controller.logout);
router.get("/editproducts", middleware.islogin, controller.editpage);
router.get("/edit-product/:id", middleware.islogin, controller.editproduct);

router.get("/blockproduct", middleware.islogin, controller.blockproduct);
router.get("/delete-product/:id", middleware.islogin, controller.admindelete);
router.get(
  "/unblock_product/:id",
  middleware.islogin,
  controller.unblockproduct
);
router.get(
  "/block_product/:id",
  middleware.islogin,
  controller.admin_block_product
);
router.get("/usermanagement", middleware.islogin, controller.usermanagement);
router.get("/delete-user/:id", middleware.islogin, controller.deleteUser);
router.get("/unblock-user/:id", middleware.islogin, controller.unblockUser);
router.get(
  "/categorymanagement",
  middleware.islogin,
  controller.categorymanagement
);
router.post("/categoryadd", middleware.islogin, controller.categoryadd);
router.get("/categoryblock/:id", middleware.islogin, controller.categoryblock);
router.get(
  "/categoryunblock/:id",
  middleware.islogin,
  controller.categoryunblock
);
router.post(
  "/productSearch",
  middleware.islogin,
  controller.adminproductsearch
);

router.post("/productadd", upload.array("images", 5), controller.productadd);

router.post(
  "/uploadEditedProduct",
  middleware.islogin,
  upload.array("images", 5),
  controller.updateProduct
);
router.get("/productlistredirection", controller.productredirection);
router.get("/ordernfo", middleware.islogin, orderController.ordernfo);
router.get(
  "/order_details/:id",
  middleware.islogin,
  orderController.orderdetailsofuser
);
router.post(
  "/update-order-status/:orderId",
  middleware.islogin,
  orderController.updateorderstatus
);
router.post("/remove-image", middleware.islogin, controller.remove_image);
router.get("/SalesReports", middleware.islogin, controller.SalesReport);
router.post(
  "/generateSalesReport",
  middleware.islogin,
  controller.getSalesReports
);

router.get("/sortedByDateredirect", controller.sortedByDateredirect);


router.get("/AddCoupons",middleware.islogin,couponController.AddCoupons);
router.post("/createCoupon",middleware.islogin,couponController.createCoupon)

module.exports = router;
