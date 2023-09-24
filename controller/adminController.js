require("dotenv").config();

const Product = require("../model/productSchema");
const user=require("../model/userSchema")
const express = require("express");
const adminCollection = require("../model/adminSchema");
const categories=require("../model/categorySchema")

const multer = require("multer");

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


exports.login = async (req, res) => {
  res.render("admin/login");
};

exports.dashboard = async (req, res) => {
  const data = await adminCollection.findOne({ email: req.body.email });

  if (data.email == req.body.email && data.password == req.body.password) {
    console.log("before session");
    req.session.adminuser = req.body.email;
    res.render("admin/dashboard.ejs");
  } else {
    res.redirect("/admin");
  }
};
exports.homepage=async(req,res)=>{
  res.render("admin/dashboard.ejs")
}

exports.productlist = async (req, res) => {
  const products = await Product.find({ status: "unblocked" });

  res.render("admin/productlist", { products });
};
exports.addproduct = async (req, res) => {
  const categorydata=await categories.find()
  res.render("admin/addproduct.ejs",{categorydata});
};
exports.productadd = async (req, res) => {
  console.log("reached")
 
    try {
      const { name, description, price, selling_price, category, size, gender, brand, stock,status } = req.body;
      const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
  
      const product = new Product({
        name,
        description,
        price,
        selling_price,
        category,
        size,
        gender,
        brand,
        status,
        stock,
        images: imageUrls
      });
      console.log("category id is =>"+category)
  
      await product.save();
      // res.send("Product uploaded successfully.");
      const products=await Product.find()
      res.render("admin/productlist.ejs",{products})
    } catch (error) {
      console.error("Error uploading product:", error);
      res.status(500).send("Error uploading product.");
    }
  }

exports.logout = async (req, res) => {
  res.redirect("/admin");
};
exports.editpage = async (req, res) => {
  
  const products = await Product.find();
  res.render("admin/productlist.ejs", { products });
};
let updateId = "";
exports.editproduct = async (req, res) => {
  const categorydata=await categories.find()
  const id = req.params.id;
  updateId = id;
  const product = await Product.findOne({ _id: id });

  res.render("admin/editproduct.ejs", { product,categorydata });
};

// module.exports.updateProduct = async (req, res) => {
//   console.log("Before updation");
//   console.log(req.body);

//   const {
//     name,
//     description,
//     price,
//     size,
//     category,
//     selling_price,
//     gender,
//     brand,
//     stock,
//     status,
//   } = req.body;
//   const images = req.files;

//   if (!images || images.length === 0) {
//     return res.status(400).send("No images uploaded.");
//   }

//   const imgArray = images.map((image) => ({
//     data: image.buffer,
//     contentType: image.mimetype,
//   }));

//   try {
//     const updateData = {
//       name,
//       description,
//       price,
//       size,
//       category,
//       selling_price,
//       gender,
//       brand,
//       stock,
//       status,
//       img: imgArray, // Save an array of images
//     };

//     // Assuming updateId is passed as a parameter or retrieved from req.params
//     updateId = updateId;

//     await Product.findByIdAndUpdate(updateId, { $set: updateData });

//     res.redirect("/admin/productlist");
//   } catch (error) {
//     console.error("Error updating product:", error);
//     res.status(500).send("Error updating product.");
//   }
// };


exports.updateProduct=async(req,res)=>{
  
    const { name, description, price, selling_price, category, size, gender, brand, stock,status } = req.body;
    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    try{
           const updateData = {
            name,
            description,
            price,
            selling_price,
            category,
            size,
            gender,
            brand,
            status,
            stock,
            images: imageUrls// Save an array of images
           };
          
          updateId = updateId;

    await Product.findByIdAndUpdate(updateId, { $set: updateData });

    res.redirect("/admin/productlist");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product.");
  }
    
}


exports.loginpage = async (req, res) => {
  res.redirect("/");
};
exports.blockproduct = async (req, res) => {
  const products = await Product.find();
  res.render("admin/productlist2.ejs", { products });
};
exports.admindelete = async (req, res) => {
  const id = req.params.id;
  console.log("id is ",id)
  await Product.findByIdAndUpdate(
    { _id: id },
    {
      $set: {
        status: "blocked",
      },
    }
  );
  res.redirect("/admin/editproducts")
};

exports.unblockproduct=async(req,res)=>{
  const id=req.params.id;
  await Product.findByIdAndUpdate({_id:id},{
    $set:{
      status:"unblock"
    }
  })
  res.redirect("/admin/blockproduct")
  
}

exports.admin_block_product=async(req,res)=>{
  const id=req.params.id;
  await Product.findByIdAndUpdate({_id:id},{
    $set:{
      status:"block"
    }
  })
  res.redirect("/admin/blockproduct")
}
exports.usermanagement=async(req,res)=>{
  const users=await user.find({})
  res.render("admin/userDetails.ejs",{users})
}
exports.deleteUser = async (req, res) => {
  const id = req.params.id;
  console.log(id)

  try {
    const found = await user.findByIdAndUpdate(id, { status: false });

    if (found) {
      console.log("Product found and updated:", found);
      return res.redirect("/admin/usermanagement");
    } else {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).send("Error updating product");
  }
};
exports.unblockUser=async(req,res)=>{
  const id = req.params.id;
  console.log(id)

  try {
    const found = await user.findByIdAndUpdate(id, { status: true });

    if (found) {
      console.log("Product found and updated:", found);
      return res.redirect("/admin/usermanagement");
    } else {
      console.log("Product not found");
      return res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).send("Error updating product");
  }
}
exports.categorymanagement=async(req,res)=>{
  const categorydata=await categories.find();
  res.render("admin/page-categories",{categorydata})
}
exports.categoryadd=async(req,res)=>{
  console.log("this is category data=>", req.body.name)
  
   const  name=req.body.name

 
  await categories.create({name});
  res.redirect("/admin/categorymanagement")
}

exports.categoryblock=async(req,res)=>{
  const id=req.params.id;
  await categories.findByIdAndUpdate(id, { active: false });
  res.redirect("/admin/categorymanagement")
}
exports.categoryunblock=async(req,res)=>{
  const id=req.params.id;
  await categories.findByIdAndUpdate(id, { active: true });
  res.redirect("/admin/categorymanagement")
}
exports.adminproductsearch=async(req,res)=>{
  const name = req.body.search;
  const regex = new RegExp(`^${name}`, "i");
  const products = await Product.find({ name: { $regex: regex } }).exec();
  res.render("admin/productlist", { products });
}