require("dotenv").config();
const path = require("path");
const sharp = require("sharp");
const fs = require("fs"); 
const PDFDocument = require('pdfkit');
const Product = require("../model/productSchema");
const user=require("../model/userSchema")
const express = require("express");
const adminCollection = require("../model/adminSchema");
const categories=require("../model/categorySchema");
const Order=require("../model/orderSchema")



const upload=require("../helper/multerfile")

exports.login = async (req, res) => {
  res.render("admin/login");
};

exports.dashboard = async (req, res) => {
  const orderCountsByMonth = [];
  const order=await Order.find();
  const products=await Product.find();
  const productlength=products.length;
  const orederlength=order.length;
  const categor= await categories.find({active:true});
  let categorieslength=categor.length
const revenue=await Order.find({paymentStatus:"paid"});
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

const monthlyorders = await Order.find({
  date: { $gte: startOfMonth, $lte: endOfMonth },paymentStatus: 'paid'
  
});

let monthlytotal=0;
let finalmonthlytotal=monthlyorders.forEach((product)=>{
  monthlytotal+=product.totalAmount;
})

let total=0;
const totalRevenue=revenue.forEach((product)=>{
  total+=product.totalAmount
})
const orders = await Order.find();
  
  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const month = orderDate.getMonth() + 1;  // Month is zero-based, so we add 1
    const year = orderDate.getFullYear();
    
    // Check if there's an entry for this month and year
    const existingEntry = orderCountsByMonth.find(entry => entry.month === month && entry.year === year);
    
    if (existingEntry) {
      existingEntry.count++;
    } else {
      orderCountsByMonth.push({ month, year, count: 1 });
    }
  });

  console.log("orderCountsByMonth==>",orderCountsByMonth)
  console.log(orderCountsByMonth[0])

  const data = await adminCollection.findOne({ email: req.body.email });
  if(data){
    if (data.email == req.body.email && data.password == req.body.password) {
     
      req.session.adminuser = data
      res.render("admin/dashboard.ejs",{totalRevenue:total,productlength,orederlength,categorieslength,orderCountsByMonth,monthlytotal});
    }else{
      res.redirect("/admin");
    }
  }

   else {
  
    res.redirect("/admin");
   
  }
};
exports.homepage=async(req,res)=>{
  const orderCountsByMonth = [];
  const order=await Order.find();
  const products=await Product.find();
  const productlength=products.length;
  const orederlength=order.length;
  const categor= await categories.find({active:true});
  let categorieslength=categor.length
const revenue=await Order.find({paymentStatus:"paid"});
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const monthlyorders = await Order.find({
  date: { $gte: startOfMonth, $lte: endOfMonth },paymentStatus: 'paid'
  
});
let monthlytotal=0;
let finalmonthlytotal=monthlyorders.forEach((product)=>{
  monthlytotal+=product.totalAmount;
})

let total=0;
const totalRevenue=revenue.forEach((product)=>{
  total+=product.totalAmount
})
const orders = await Order.find();
  
  orders.forEach(order => {
    const orderDate = new Date(order.date);
    const month = orderDate.getMonth() + 1;  // Month is zero-based, so we add 1
    const year = orderDate.getFullYear();
    
    // Check if there's an entry for this month and year
    const existingEntry = orderCountsByMonth.find(entry => entry.month === month && entry.year === year);
    
    if (existingEntry) {
      existingEntry.count++;
    } else {
      orderCountsByMonth.push({ month, year, count: 1 });
    }
  });

  console.log("orderCountsByMonth==>",orderCountsByMonth)
  console.log(orderCountsByMonth[0])

  
  res.render("admin/dashboard.ejs",{totalRevenue:total,productlength,orederlength,categorieslength,orderCountsByMonth,monthlytotal});
  console.log(orderCountsByMonth[0].count)
}

exports.productlist = async (req, res) => {
  const products = await Product.find({ status: "unblocked" });

  res.render("admin/productlist2", { products });
};
exports.addproduct = async (req, res) => {
  const categorydata=await categories.find()
  res.render("admin/addproduct.ejs",{categorydata});
};
exports.productadd = async (req, res) => {
  console.log("reached");

  try {
    const { name, description, price, selling_price, category, size, gender, brand, stock, status } = req.body;

    // Define the desired crop dimensions (width, height)
    const width = 700;
    const height =600;
   

    const imagePromises = req.files.map(async file => {
      const filePath = path.join('assets/uploads', file.filename);

      // Use Sharp to resize and crop the image
      const croppedBuffer = await sharp(filePath)
        .resize(width, height)
        .toBuffer();

      // Save the cropped image
      const croppedFilename = 'cropped-' + file.filename;
      const croppedFilePath = path.join('assets/uploads', croppedFilename);
      fs.writeFileSync(croppedFilePath, croppedBuffer);

      return `/uploads/${croppedFilename}`;
    });

    const imageUrls = await Promise.all(imagePromises);

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

    console.log("category id is =>" + category);

    await product.save();

    const products = await Product.find();
    res.redirect("/admin/productlistredirection");
  } catch (error) {
    console.error("Error uploading product:", error);
    res.status(500).send("Error uploading product.");
  }
};

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



exports.updateProduct = async (req, res) => {
  const { name, description, price, selling_price, category, size, gender, brand, stock, status } = req.body;
  const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

  try {
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
      images: imageUrls // Save an array of images
    };
    updateId = updateId;

    const updatedProduct = await Product.findByIdAndUpdate(updateId, { $set: updateData }, { new: true });

    // Define the desired crop dimensions (width, height)
    const width = 700;
    const height = 600;

    const updatedImagePromises = updatedProduct.images.map(async imageUrl => {
      const imagePath = path.join('assets', imageUrl);

      // Use Sharp to resize and crop the image
      const croppedBuffer = await sharp(imagePath)
        .resize(width, height)
        .toBuffer();

      // Save the cropped image
      const croppedFilename = 'cropped-' + path.basename(imagePath);
      const croppedFilePath = path.join('assets/uploads', croppedFilename);
      fs.writeFileSync(croppedFilePath, croppedBuffer);

      return `/uploads/${croppedFilename}`;
    });

    const updatedCroppedImageUrls = await Promise.all(updatedImagePromises);

    updatedProduct.images = updatedCroppedImageUrls;
    await updatedProduct.save();

    res.redirect("/admin/productlist");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).send("Error updating product.");
  }
};

exports.remove_image=async(req,res)=>{
  console.log("body is===>",req.body);
  return
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
      status:"unblocked"
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
     
      return res.redirect("/admin/usermanagement");
    } else {
    
      return res.status(404).send("Product not found");
    }
  } catch (error) {
   
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
exports.productredirection=async(req,res)=>{
  const products=await Product.find();
  res.render("admin/productlist2.ejs",{products})
}
exports.SalesReport=async(req,res)=>{
  const data = await Order.find({
    orderStatus: { $in: ["payment Failed", "delivered", "Confirmed","Placed"] }
  })
  console.log("confirmed orders are==>",data)
  res.render("admin/salesReports",{data})
}
exports.getSalesReports = async (req, res) => {
  const { startDate, endDate } = req.body;
console.log("req.body is==>",req.body)
  const data = await Order.find({
    orderStatus: { $in: ["payment Failed", "delivered", "Confirmed", "Placed"] },
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  const encodedData = encodeURIComponent(JSON.stringify(data));

  const redirectURL = `/admin/sortedByDateredirect?data=${encodedData}`;

  return res.status(200).json({
    redirectURL,
    encodedData
  });
};
exports.sortedByDateredirect=async(req,res)=>{
  const dataString = req.query.data; // Assuming data is a JSON string
  let dataObject;
  
  try {
    dataObject = JSON.parse(dataString);
    console.log('Data parsed successfully:', dataObject);
  } catch (error) {
    console.error('Error parsing data:', error);
  }
  console.log("data type of data==>" , typeof dataObject)

  res.render("admin/salesReports",{data:dataObject})
}