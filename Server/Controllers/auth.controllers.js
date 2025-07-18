import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { userModel } from '../models/user.model.js';
import { transporter } from '../DB/nodemailer.js';

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Missing details" });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({ name, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    //sending welcome email

    const mailOption={
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Welcome to GreatStack',
        text: `welcome to GreatStack website. Your account has been created with this email id ${email}`
    }

    await transporter.sendMail(mailOption);

    return res.status(201).json({ success: true, message: "User registered successfully!" });
  } 
  catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ success: false, message: "Please enter all details" });

  try {
    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "Invalid email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ success: true, message: `Welcome ${user.name}` });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });

  return res.status(200).json({ success: true, message: "User logged out" });
};

//send verification OTP to the user's email
export const sendVerifyOtp= async(req,res)=>{

    try {
        
        const {userId}= req.body ;

        const User= await userModel.findById(userId);


        if(User.isEmailVerified){
           return res.status(200)
                     .json({success:true,message:'User Email already verified'})
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        User.verifyOtp= otp;
        User.verifyOtpExpiredAt= Date.now() + 24 * 60 * 60 * 1000 //1d
        
      await User.save();

      //sending verification OTP mail 
    const mailOption={
        from: process.env.SENDER_EMAIL,
        to: email,
        subject: 'Account Verification OTP',
        text: `Your OTP is ${otp}. Verify your account using this OTP.`
    }

    await transporter.sendMail(mailOption);

     return res.status(200)
               .json({success:true,message:'Verification OTP sent on this Email'})
 } catch (err) {
         return res.status(400).json({ success: false, message: err.message });
    }
}

export const verifyEmail= async(req,res)=>{

        const {userId, otp}= req.body;

        if(!userId || !otp){
             return res.status(400)
                       .json({ success: false, message: "Missing Details" });
        }
        
        try{
       
            const User= await userModel.findById(userId);

            if(!User){
                return res.status(404)
                       .json({ success: false, message: "User not found" }); 
            }
            if( User.verifyOtp=='' || User.verifyOtp!== otp){
                 return res.status(400)
                       .json({ success: false, message: "Invalid OTP" });
            }

            if(User.verifyOtpExpiredAt < Date.now()){
                return res.status(400)
                          .json({ success: false, message: "OTP Expired" });
            }
            User.isEmailVerified= true;
            User.verifyOtp='';
            User.verifyOtpExpiredAt='';


            await User.save();

            return res.status(200)
                          .json({ success: true, message: "Email verified Successfully" });
        }
    catch (err) {
        return res.status(400).json({ success: false, message: "" });
    }
}