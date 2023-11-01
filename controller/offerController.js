
const ReferralOffer=require("../model/referralOfferSchema")

const referraloffer=async(req,res)=>{
    let referraldata = await ReferralOffer.find().sort({ _id: -1 }).limit(1);
   
    let refOffer=referraldata[0].referraloffer;
    let referredOffer=referraldata[0].referredoffer
    res.render("admin/referraloffer",{refOffer,referredOffer})
};
const referralOfferadd=async(req,res)=>{
    try {
        
        const { referraloffer, referredoffer } = req.body;
    
        const newReferralOffer = new ReferralOffer({
            referraloffer,
            referredoffer
        });
    
        await newReferralOffer.save();
    
     
    
        // Redirect to the desired page
        res.redirect('/admin/referraloffer');
      } catch (error) {
        console.error(error);
        // Handle the error and possibly send an error response
        res.status(500).send('Internal Server Error');
      }
}

module.exports={referraloffer,referralOfferadd}