const user=require("../model/userSchema")

const userwallet=async(req,res)=>{
    let data=await user.find({_id:req.session.user[0]._id})

    res.render("user/wallet",{isAuthenticated:true,data})

}
const lowWalletbalance=async(req,res)=>{
    res.render("user/walletpaymentfailure",{isAuthenticated:true})
}
const successWalletpayment=async(req,res)=>{
    res.redirect("/orderplacedsuccessfully")
}

module.exports={userwallet,lowWalletbalance,successWalletpayment}