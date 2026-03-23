//====================================== for mongodb connection===========================================

//for connection to mongodb
const mongoose= require('mongoose');

const connectDB= async() => {
    try {
        await mongoose.connect('mongodb+srv://nodeDingo:node123@cluster0.qemvugm.mongodb.net/loginDB?appName=Cluster0');
            console.log("MongoDb is connected");
    }catch(error){
        console.log(error);
    }
}

module.exports= connectDB;