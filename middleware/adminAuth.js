

const islogin = async (req, res, next) => {
  if (req.session.adminuser) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

const islogout = async (req, res, next) => {
  req.session.adminuser=null;
  next();
};


const adminexist=async(req,res,next)=>{
    if(req.session.adminuser ){
        res.redirect("/admin/home")

    }else{
      next()
    }
}

module.exports={islogin,islogout,adminexist}