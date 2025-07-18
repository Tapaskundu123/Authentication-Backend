import bcrypt from 'bcryptjs';
import { userModel } from '../Models/user.model.js';
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser';
import { StrictMode } from 'react';

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

           return res.status(201)
                 .json({success:true,message:"User Registered successfully!"})


    } catch (err) {
        res.status(400)
           .json({success:false, message:err.message})
    }
}

export const LoginUser= async(req,res)=>{

  
    try{

        const { email, password }= req.body;
        
        if(!email || !password){
            return res.status(404)
                      .json({success:false, message:"Please enter full details"})
        }

        const User= await userModel.findOne({email})


        if(!User){
            return res.status(404)
                      .json({success:false, message:"Invalid Email"})
        }

        const isPasswordCorrect= await bcrypt.compare(password,User.password);

        if(!isPasswordCorrect){
          return res.status(400)                 
                    .json({success:false, message:"Invalid Password"})
        }
        const token= jwt.sign({id:userModel._id},process.env.JWT_SECRET_KEY,{expiresIn:'7d'})

        res.cookie('token',token,{
            HttpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'? 'none':'strict',
            maxAge: 7*24*60*60*1000  //7d
        })
        const name= await User.name;
       return res.status(201)
                 .json({success:true,message:`Welcome ${name}!`})


        }
   
    catch(err){
      return res.status(400)
                .json({success:false,message:err.message})
    }
}

export const LogoutUser= async(req,res)=>{
     
    try {
        res.clearCookie('token',{
            HttpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:process.env.NODE_ENV==='production'? 'none':'strict',
            maxAge: 7*24*60*60*1000  //7d
        });
   
           return res.status(201)
                 .json({success:true,message:"User Logged Out"})
      
    } 
    catch (err) {
        return res.status(400)
                .json({success:false,message:err.message})
    }

}