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

const Excel = require("exceljs");

const workbook = new Excel.Workbook();
const worksheet = workbook.addWorksheet('Sales List');

const upload=require("../helper/multerfile")

exports.login = async (req, res) => {
  res.render("admin/login");
};
exports.generatesalesreport=async(req,res)=>{
  const data=await Order.find({})  .populate({
    path: "products.productId",
    model: "productCollection",
  })
  .populate({
    path: "userId",
    model: "runnerslogins",
  });

  const salesReportColumns  = [
    { key: "ord", header: "Order ID" },
    { key: "username", header: "Customer Name" },
    { key: "email", header: "Customer Email" },
    { key: "name", header: "Product Details" },
    { key: "address", header: "Customer Address" },
    { key: "couponDiscount", header: "Discount" },
    { key: "totalAmount", header: "Total Amount" },
    { key: "date", header: "Order Date" },
    { key: "orderStatus", header: "Order Status" },
    { key: "paymentMethod", header: "Payment Method" },
    { key: "paymentStatus", header: "Payment Status" },
  
    
  ];
  
  data.forEach((order) => {
    order.products.forEach((product) => {
      
      const salesData = {
        ord: order.ord,
        username: order.userId.username,
        email: order.userId.email,
        name: `${product.productId.name}, Price: ${product.price}, Quantity: ${product.quantity}`,
        address: order.address.homeAddress,
        couponDiscount: order.couponDiscount,
        totalAmount: order.totalAmount,
        date: order.date,
        orderStatus: order.orderStatus,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        
      };
      worksheet.addRow(salesData);
    });
  });
  worksheet.columns = salesReportColumns;
  data.forEach((datas) => {
    worksheet.addRow(datas);

  });
  worksheet.columns.forEach((sheetColumn) => {
    sheetColumn.font = {
      size: 12,
    };
    sheetColumn.width = 30;
  });

  worksheet.getRow(1).font = {
    bold: true,
    size: 13,
  };
  const exportPath = path.resolve(__dirname, 'salesData.xlsx');

await workbook.xlsx.writeFile(exportPath);
res.download(exportPath,"salesData.xlsx")
}
exports.dashboard = async (req, res) => {
  const orderCountsByMonth = [];
  const order=await Order.find();
  const products=await Product.find();
  const productlength=products.length;
  const orederlength=order.length;
  const categor= await categories.find({active:true});
  let categorieslength=categor.length
  const revenue = await Order.find({ 
    $and: [
      { orderStatus: { $ne: "Cancelled" } },
      { orderStatus: { $ne: "Return" } },
      {orderStatus:{$ne:"payment Failed"}},
      {orderStatus:{$ne:"Return"}},
    ]
  });
const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

const monthlyorders = await Order.find({
  $and: [
    { date: { $gte: startOfMonth, $lte: endOfMonth } },
    { orderStatus: { $ne: "Cancelled" } },
    { orderStatus: { $ne: "payment Failed" } },
    {orderStatus:{$ne:"payment Failed"}},
    {orderStatus:{$ne:"Return"}},
     // Add this condition
  ]
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
  const revenue = await Order.find({ 
    $and: [
      { orderStatus: { $ne: "Cancelled" } },
      { orderStatus: { $ne: "Return" } },
      {orderStatus:{$ne:"payment Failed"}},
      {orderStatus:{$ne:"Return"}},
    ]
  });
  

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

const monthlyorders = await Order.find({
  $and: [
    { date: { $gte: startOfMonth, $lte: endOfMonth } },
    { orderStatus: { $ne: "Cancelled" } },
    { orderStatus: { $ne: "payment Failed" } },
    {orderStatus:{$ne:"payment Failed"}},
    {orderStatus:{$ne:"Return"}},
     // Add this condition
  ]
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

  

  
  res.render("admin/dashboard.ejs",{totalRevenue:total,productlength,orederlength,categorieslength,orderCountsByMonth,monthlytotal});
  
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
  const productdetails=await Product.findOne({_id:updateId});
  
  

  try {
    const productdetails = await Product.findOne({ _id: updateId });
    const existingImages = productdetails.images;

    // Check if there are new images uploaded in the request
    const newImages = req.files;
    const imageUrls = newImages.map(file => `/uploads/${file.filename}`);

    // Merge existing images with new ones or keep existing if new images are not provided
    const updatedImages = newImages.length > 0 ? imageUrls : existingImages;

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
      images: updatedImages
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
 

  try {
    const found = await user.findByIdAndUpdate(id, { status: false });

    if (found) {
     
      return res.redirect("/admin/usermanagement");
    } else {
    
      return res.status(404).send("Product not found");
    }
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).send("Error updating product");
  }
};
exports.unblockUser=async(req,res)=>{
  const id = req.params.id;


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
exports.categoryadd = async (req, res) => {
 

  const name = req.body.name.toUpperCase();

  const categoryOffer = req.body.offer;
  const offerValidFrom=req.body.startdate;
  const offerValidTo=req.body.enddate
 

  await categories.create({ name, categoryOffer,offerValidFrom,offerValidTo }); // Include categoryoffer in the object
  res.redirect("/admin/categorymanagement");
};
exports.categoriesupdate = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, categoryOffer,offerValidFrom,offerValidTo } = req.body;

    // Find the category by its ID
    const category = await categories.findOne({ _id: id });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Update the category properties
    category.name = name.toUpperCase()
    category.categoryOffer = categoryOffer;
    category.offerValidFrom=offerValidFrom
    category.offerValidTo=offerValidTo
   

    // Save the updated category
    await category.save();

    res.redirect("/admin/categorymanagement")
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.categoryedit=async(req,res)=>{
  const id=req.params.id;
  const category=await categories.findOne({_id:id});
  res.render("admin/editcategory",{category})

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

  res.render("admin/salesReports",{data})
}
exports.getSalesReports = async (req, res) => {
  const { startDate, endDate } = req.body;

  const data = await Order.find({
    orderStatus: { $in: ["payment Failed", "delivered", "Confirmed", "Placed"] },
    date: { $gte: new Date(startDate), $lte: new Date(endDate) }
  });

  
  req.session.salesData = data;

  const redirectURL = `/admin/sortedByDateredirect`;

  return res.status(200).json({
    redirectURL,
    
  });
};
exports.sortedByDateredirect=async(req,res)=>{
  
  let data = req.session.salesData;
  
  

  res.render("admin/salesReports",{data})
}