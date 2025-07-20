import mongoose from "mongoose";
import 'dotenv/config'

const ConnectDB= async()=>{

    try {
 
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('✅ MongoDB Connected');

    } catch (err) {
          console.error('❌ MongoDB connection error:', err.message);
          process.exit(1); // Exit on failure
    }
}
export default ConnectDB;
