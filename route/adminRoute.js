const process = require("dotenv").config();

const express = require("express");
const router = express.Router();
const controller = require("../controller/adminController");
const middleware = require("../middleware/adminAuth");
const multer = require("multer");
const Product=require("../model/productSchema")
const path=require("path")

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/uploads');  // Save images to the 'uploads' directory
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Append a timestamp and file extension
  }
});
  
const upload = multer({ storage: storage });


router.get("/", controller.login);
router.post("/login", controller.dashboard);
router.get("/home",middleware.islogin,controller.homepage)
router.get("/login", controller.loginpage);
router.get("/productlist", middleware.islogin, controller.productlist);
router.get("/addproducts", middleware.islogin, controller.addproduct);
// router.post("/productadd", upload.array("productImage"), controller.productadd);
router.get("/logout",middleware.islogout, controller.logout);
router.get("/editproducts", middleware.islogin, controller.editpage);
 router.get("/edit-product/:id", middleware.islogin, controller.editproduct);
  // router.post("/uploadEditedProduct",middleware.islogin,upload.array("images"), controller.updateProduct);
router.get("/blockproduct", middleware.islogin,controller.blockproduct);
router.get("/delete-product/:id",middleware.islogin, controller.admindelete);
router.get("/unblock_product/:id", middleware.islogin,controller.unblockproduct);
router.get("/block_product/:id", middleware.islogin,controller.admin_block_product);
router.get("/usermanagement",middleware.islogin,controller.usermanagement);
router.get("/delete-user/:id",middleware.islogin,controller.deleteUser);
router.get("/unblock-user/:id",middleware.islogin,controller.unblockUser);
router.get("/categorymanagement",middleware.islogin,controller.categorymanagement);
router.post("/categoryadd",middleware.islogin,controller.categoryadd);
router.get("/categoryblock/:id",middleware.islogin,controller.categoryblock);
router.get("/categoryunblock/:id",middleware.islogin,controller.categoryunblock);
router.post("/productSearch",middleware.islogin,controller.adminproductsearch);





  
  
  router.post('/productadd', upload.array('images', 5),controller.productadd );
  
  router.post("/uploadEditedProduct",middleware.islogin,upload.array("images",5), controller.updateProduct);

module.exports = router;
