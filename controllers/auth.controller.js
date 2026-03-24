// ========================================For all the logic==================================================
//for bcrypt password hashing
const bcrypt= require('bcrypt');

//for jwt token execution
const jwt= require('jsonwebtoken');

const {validationResult}= require('express-validator');

const SECRET_KEY= process.env.JWT_SECRETKEY;

const userSchema= require('../models/User');

//we will remove the middleware from here and will keep it in middleware file, and then combinedly we will call these APIS from routing file

//post method to signup for a new user-- this will create a new user document in MongoDB
exports.signup= async(req, res, next)=>{  //authMiddleWare here is being used as route based middleware
    console.log("Signup route hit")
    try{
        const errorResult= validationResult(req); //can't use (validator as a name directly)
        if(!errorResult.isEmpty()){
            return res.status(400).json({
                "error":errorResult.array()
            })
        }else{
            const user= new userSchema(req.body);
            const hashedPassword= await bcrypt.hash(user.password, 10); // here we are using bcrypt to hash the password, 10 is the security level called salt rounds
            user.password= hashedPassword;
            await user.save();
            res.status(200).json({
                "message":"New User is created"
            })
        }
    }catch(error){
        next(error); // express only sends error to global handler when we pass it to next()
    }
};

//get API to login for user-- first checking whether user exists or not after searching in DB if emailid exists or not, then checking if password is correct or not
exports.login= async(req, res, next)=>{
    try{
        const user= new userSchema(req.body);
        const emailIdExists= await userSchema.findOne({"emailId": user.emailId})
        if(emailIdExists){
            const passwordCompare= await bcrypt.compare(user.password, emailIdExists.password) // this compares hashedpassword and normal password
            if(passwordCompare){
                //the format for creating token - (credentials, secret, options)
                const token= jwt.sign({
                    userId: emailIdExists._id, 
                    emailId: emailIdExists.emailId,//userId and emailId will be stored in the token
                    role: user.role //role will also be stored in token for authorized access only
                },
                SECRET_KEY,
                {
                    expiresIn: "1h"
                })

                res.status(200).json({
                    "message":"User successfully logged in",
                    "token":token
                })
            }else{
                return res.status(500).json({
                    "message":"Not able to login. Username/ Password is incorrect."
                })
            } 
        }else{
             return res.status(500).json({
                "message":"User not found."
            })
        }
    }catch(error){
        next(error)
    }
}

//we will get users list according to page number and limit(how many data will be in one page)
exports.getUsersList= async(req, res, next) => {
    try{
        const page= parseInt(req.query.page) || 1;
        const limit= parseInt(req.query.limit) || 5;

        const skip= (page - 1) * limit;

        let usersList= await userSchema.find().skip(skip).limit(limit); // we will pass page number and limit in here


        //we will use this to filter by any parameter
        const role = req.query.role;
        const filter= {};

        if(role){
            filter.role= role;
        }

        usersList= await userSchema.find(filter);

        //we will use this to search with any pattern matching, for name/email etc.
        const search = req.query.search;
        const searchFilter= {};

        if(search){
            searchFilter.name= {    // $regex-- pattern matching, $options-- ignore case
                $regex: search,
                $options: "i"
            }
        }

        usersList= await userSchema.find(searchFilter);

        res.json({page,
                  limit,
                  data: usersList
        })
    }catch(error){
        next(error);
    }
}

exports.deleteUser= async(req,res) => {  //authorized access for specific roles only
    const deleteUser= await userSchema.findByIdAndDelete(req.params.id);
    res.json({
        message: "User is deleted",
        user: deleteUser
    })
}

exports.updatedUsers= async(req,res) => {  //authorized access for specific roles only
    const updatedUser= await userSchema.findByIdAndUpdate(req.params.id, req.body, {new : true}); // {new : true} ensures we get the exact updated data, not the old one
    if(!updatedUser){
    res.json({
        status:"404",
        message: "User not found"
    })
    }else{
    res.json({
        message: "user is updated",
        user: updatedUser
    });
    } 
}

exports.profile= (req,res) => {
    res.json({
        message: "Protected data is received",
        user: req.user
    })
}

//how to get all users list
// find() will get the whole list
// findOne({emailId:"test@test.com"}) --helps to find a doc by their properties
// findById(id) --helps to find a doc by their id
exports.usersList= async(req, res)=>{
    const user= await userSchema.findOne({"name":"Abhishek"})
    const users= await userSchema.find() // find() gets all documents inside mongodb. userSchema is the Mongoose model. 
    res.json(users) //this sends JSON back 
}