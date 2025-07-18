import mongoose from "mongoose";
import 'dotenv/config'

const ConnectDB= async()=>{

    try {
    //  mongoose.connection.on('connected',()=>{
    //     console.log('Database Connected');
    //  })
        await mongoose.connect(process.env.MONGODB_URI,{
             useNewUrlParser: true,
             useUnifiedTopology: true,
        })
        console.log('✅ MongoDB Connected');

    } catch (err) {
          console.error('❌ MongoDB connection error:', err.message);
          process.exit(1); // Exit on failure
    }
}
export default ConnectDB;
