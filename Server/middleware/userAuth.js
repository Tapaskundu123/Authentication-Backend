import jwt from 'jsonwebtoken';

export const UserAuthMiddleware= async(req,res,next)=>{


    try {
        
        const {token} = req.cookie;

        if(!token){
            return res.status(404)
            .json({success:false,message:'token not found'})
        }

        const decodedToken= jwt.verify(token,process.env.JWT_SECRET);// token collect for taken the userId from DB or JWT.

        if(decodedToken.id){
            req.body.userId= decodedToken.id; // give the userId for the verification purposes
        }
        else{
            return res.status(400)
              .json({success:false,message:'Not Authorized, Login Again'});
        }

        next();
    } catch (err) {
        return res.status(400)
              .json({success:false,message: err.message});
    }
   
}