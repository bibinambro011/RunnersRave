const islogin = async (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/");
  }
};
cartAuth=async(req,res,next)=>{
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
  if(req.session.user || !req.session.user){
    res.redirect("/")
  }else{
    next()
  }
}

module.exports = { islogin, islogout,userexist,cartAuth };
