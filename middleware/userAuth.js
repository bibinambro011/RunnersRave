const Product=require("../model/productSchema")

const islogin = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/userhome");
  }
};
const cartAuth=async(req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect("/login")
  }
}


const islogout = async (req, res, next) => {
  req.session.user=null;
  next();
};

const userexist=async(req,res,next)=>{
  if(req.session.user){
  if(req.session.user){
    isAuthenticated=true;
    const products = await Product.find({status:"unblocked"});
  res.render("user/home.ejs", { products,isAuthenticated });
  }else{
    const isAuthenticated=false;
  const products = await Product.find({status:"unblocked"});
  res.render("user/home.ejs", { products,isAuthenticated });
}
  }else{
    next()
  }
  
}


module.exports = { islogin, islogout,userexist,cartAuth,userexist };
