const mongoose = require('mongoose');
require('dotenv').config();
const mongo_uri = process.env.mongo_uri;

const connectDb = async () =>{
    try{
        await mongoose.connect(mongo_uri);
        console.log("MongoDB Connected");
    }catch (error){
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;
