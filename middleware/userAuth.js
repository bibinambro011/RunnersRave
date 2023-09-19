const islogin = async (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      res.redirect("/userloginacc");
    }
  };
  
  const islogout = async (req, res, next) => {
    req.session.destroy();
    next();
  };
  
  module.exports={islogin,islogout}