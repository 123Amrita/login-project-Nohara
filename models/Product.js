const mongoose= require('mongoose');

const productSchema= new mongoose.Schema({
    productName: String,
    user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
    }
    
});

module.exports= mongoose.model("Product", productSchema);