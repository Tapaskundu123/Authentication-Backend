import { userModel } from "../models/user.model.js";

export const getUserData= async(req,res)=>{

    try {
        const {userId}= req.body;

        const User= await userModel.findById(userId);

        if(!User){
           return res.status(404)
                     .json({success: false, message:"User not found"})
         }

         return res.status(200)
                   .json({
                    success:true,
                    userData:{
                        name:User.name,
                        email:User.email,
                        isAccountVerified:User.isEmailVerified,
                    }
                   })       
            }  
    catch (err) {
        return res.status(500)
        .json({success:false, message: err.message})
    }
}