import bcrypt from 'bcryptjs';
import { userModel } from '../Models/user.model.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';

export const register= async(req,res)=>{
    
    const {name, email, password}= req.body;

    if( !name || !email|| !password){
        return res.status(404)
                  .json({
                     success:false,
                     message:"Missing Details",
        })
    }

    try {
        
        const isExistedUser= await userModel.findOne({email});

        if(isExistedUser){
            return res.status(400)
                       .json({success:false,message:"Email Already Exists"})
        }
        
        const hashPassword= await bcrypt.hash(password,10);
        
        const UserDB= new userModel({name,email,password:hashPassword})

        UserDB.save();

        const token= jwt.sign({id:UserDB._id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})
    
        res.cookie('token',token,{
            HttpOnly:true,
            secure:process.env.NODE_ENV==='Production',
            sameSite:process.env.NODE_ENV==='Production'? none:strict,
            maxAge: 7*24*60*60*1000
        });
    } catch (err) {
        res.status(400)
           .json({success:false, message:err.message})
    }
}