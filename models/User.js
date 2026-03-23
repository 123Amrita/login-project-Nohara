const mongoose= require('mongoose');

const userSchema= new mongoose.Schema({
    name: String,
    emailId: String,
    password: String,
    role: String
});

module.exports= mongoose.model("User", userSchema);