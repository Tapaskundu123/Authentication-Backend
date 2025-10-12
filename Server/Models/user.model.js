// ...existing code...
import mongoose from "mongoose";
const userSchema= new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verifyOtp:{
        type:String,
        default:'' // changed to empty string
    },
    verifyOtpExpiredAt:{
        type:Date,
        default: null // changed to null
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    resetOTP:{
        type:String,
        default:'' // changed to empty string
    },
    resetOTPExpiredAt:{
        type: Date,
        default: null // changed to null
    }
})

export const userModel= mongoose.model('Users',userSchema);
// ...existing code...