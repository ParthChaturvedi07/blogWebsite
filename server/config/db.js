const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        mongoose.set('strictQuery', false)
        const conn = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`Database Connect : ${conn.connection.host}`);
    } catch (error){

    }
}

module.exports = connectDB;