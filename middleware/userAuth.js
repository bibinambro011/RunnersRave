const Product=require("../model/productSchema")
const User=require("../model/userSchema")



const islogin = async (req, res, next) => {
 
  if (req.session.user ) {
    next();
  } else {
    res.redirect("/userhome");
  }
};
const cartislogin=async(req,res,next)=>{
  if(! req.session.user){
    res.json({ redirectUrl: "/login" }); 
  }else {
    next()
  }
}
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
    
  
  res.redirect("/userhome")
  }else{
    const isAuthenticated=false;
  const products = await Product.find({status:"unblocked"});
  res.render("user/home.ejs", { products,isAuthenticated });
}
  }else{
    next()
  }
  
}

const userblock=async(req,res,next)=>{
  if(req.session.user){
    let user=req.session.user;
    console.log(user)
    let email=user[0].email
    const  data=await User.findOne({email:email});
    console.log("status is==>",data)
    if(data.status==true){
      next()
    }else{
      const isAuthenticated=false;
      const products = await Product.find({status:"unblocked"});
      res.redirect("/userhome?reason=blocked by admin")
    }

  }else{
    next()
  }
 
}


module.exports = { islogin, 
  islogout,
  userexist,
  cartAuth,
  userexist,
  cartislogin,
  userblock };
