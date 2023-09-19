const express = require("express"); 
const router = express.Router();
const controller=require("../controller/adminController")


router.get("/",controller.login)


module.exports = router;
