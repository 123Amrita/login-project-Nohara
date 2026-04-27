// ========================================For all the logic==================================================
//for bcrypt password hashing
const bcrypt= require('bcrypt');

//for jwt token execution
const jwt= require('jsonwebtoken');

const {validationResult}= require('express-validator');

const SECRET_KEY= process.env.JWT_SECRETKEY;

const userSchema= require('../models/User');

const productSchema= require('../models/Product');

const tripSchema= require('../models/Trip');

const OpenAI= require("openai");
const { json } = require('express');
const client= new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
})

// const {GoogleGenerativeAI}= require('@google/generative-ai');

// const genAI= new GoogleGenerativeAI(
//     "AIzaSyBNuw4KsaY6sSxpZCQTYaBRaAfErSrBNFo"
//     );

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
                    "token":token,
                    "userData":user
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

exports.addNewProduct = async(req, res)=> {
   const product= new productSchema({
      productName : req.body.productName,
      user: req.body.user
   });
   await product.save();
   await product.populate("user"); //we have to use populate explicitly here too, so that in db both user and product are saved
   res.json({
    "status": "200",
     "product": product
   })
}

exports.getAllProducts= async(req, res)=> {
   const products= await productSchema.find().populate("user"); //we have to use the field name in product schema, not the user schema name
   res.json({
     "status": "200",
     "product": products
   })
}

exports.getTrekDetails= async(req, res, next)=> {
    try{
        console.log("BODY:", req.body);
        console.log("TYPE?:", typeof req.body);
        const destination= typeof req.body === "string" ? req.body : req.body.destination;

        const response= await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: `Give a short trekking overview for ${destination}.
        Generate a travel itinerary in STRICT JSON format.

Rules:
1. Please make sure to return ONLY valid JSON (no explanation, no extra text).
2. Do NOT include newline escape characters like \n or extra quotes.
3. Follow EXACT structure given below.
4. All fields must always be present (even if empty).
5. Use arrays consistently.
6. Keep keys exactly same (no renaming).
7. IMPORTANT: Please make sure all array values MUST be simple strings only.
   -DO NOT return objects inside arrays.
8. MUST include- short description in 30 words, difficulty, best time to go, highlights and treks to cover for ${destination}.

Schema:
{
  "travelInfo": [
    {
      "description": "",
      "difficulty": "",
      "best_time_to_go": "",
      "highlights": [],
      "treks_to_cover": []
    }
  ]
}`
                }
            ]
        })

        return res.json({
            message: "Overview generated",
            overview: response.choices[0].message.content
        });
    }catch(error){
        next(error);
    }
}

exports.createItinerary= async(req, res, next)=> {
    try{
        console.log("itineraryBody", req.body);
        const response= await client.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [
                {
                    role: "user",
                    content: `.
                    We will be travelling from - ${req.body.source.name} to Destination - ${req.body.destination.name},
                    from ${req.body.startDate} to ${req.body.endDate},
                    difficulty level will be ${req.body.difficulty.name},
                    with group of ${req.body.groupType.name},
                    stay preference is ${req.body.stayPreference.name},
                    Food preference is ${req.body.foodPreference.name},
                    within total Budget of ${req.body.totalBudget}.
                    Please consider this special note too, ${req.body.specialNotes}.
                    Generate a travel itinerary in STRICT JSON format.

Rules:
1. Return ONLY valid JSON (no explanation, no extra text).
2. Do NOT include newline escape characters like \n or extra quotes.
3. Follow EXACT structure given below.
4. All fields must always be present (even if empty).
5. Use arrays consistently - EVERY array must contain ONLY string values.
6. Keep keys exactly same (no renaming).
7. CRITICAL: ALL arrays must contain ONLY simple text strings - NEVER return objects, nested structures, or complex types inside any array.
   Examples of CORRECT format:
   - "activities": ["Hiking to summit", "Visit local market", "Photography session"]
   - "scenic_Spots": ["Sunrise viewpoint with mountain backdrop", "Instagram-famous waterfall", "Hidden cave with natural light"]
   - "stay": ["Hotel Royal Palace", "Mountain Lodge Resort", "Local homestay"]
   - "food": ["Traditional local restaurant", "Cafe Himalaya", "Street food vendors"]
   - "highlights": ["Best viewpoint of the day", "Encounter with local culture", "Unique rock formations"]
   - "special_notes": ["Pack warm clothes for evening", "Bring sunscreen for high altitude", "Camera essential for photo ops"]
8. Each string in arrays should be descriptive (20-40 words max) and realistic.
9. Ensure "scenic_Spots" specifically contains Instagrammable places, scenic viewing points, photography tips, or unique photo-worthy experiences as plain text strings.

Schema:
{
  "trip_info": {
    "title": "",
    "start_location": "",
    "end_location": "",
    "duration": "",
    "budget": 0
  },
  "itinerary": [
    {
      "day": 1,
      "title": "",
      "location": "",
      "activities": ["string", "string"],
      "stay": ["string", "string"],
      "food": ["string", "string"],
      "highlights": ["string", "string"],
      "scenic_Spots": ["string", "string"],
      "special_notes": ["string", "string"]
    }
  ]
}
                    `
                }
            ]
        })

        return res.json({
            message: "Overview generated",
            overview: response.choices[0].message.content
        });
    }catch(error){
        next(error);
    }
}

exports.saveItinerary= async(req,res,next) => {
    try{
    const tripDetails= new tripSchema();
    tripDetails.travelName= req.body.travelName;
    tripDetails.difficulty= req.body.difficulty.name;
    tripDetails.foodPreference= req.body.foodPreference.name;
    tripDetails.groupType= req.body.groupType.name;
    tripDetails.source= req.body.source.name;
    tripDetails.stayPreference= req.body.stayPreference.name;
    tripDetails.destination= req.body.destination.name;
    tripDetails.startDate= new Date(req.body.startDate).toString();
    tripDetails.endDate= new Date(req.body.endDate).toString();
    tripDetails.AIOverview= req.body.AIOverview;
    tripDetails.specialNotes= req.body.specialNotes;
    tripDetails.totalBudget= req.body.totalBudget;
    await tripDetails.save();
    return res.json({"message": "Successfully saved.", "status":200});
    }
    catch(error){
    next(error);
    }
    
}

exports.getTripList= async(req, res, next) => {
    try{
        const page= parseInt(req.query.page) || 1;
        const limit= parseInt(req.query.limit) || 5;

        const skip= (page - 1) * limit;

        let tripList= await tripSchema.find().skip(skip).limit(limit); // we will pass page number and limit in here


        //we will use this to filter by any parameter
        const role = req.query.role;
        const filter= {};

        if(role){
            filter.role= role;
        }

        tripList= await tripSchema.find(filter);

        //we will use this to search with any pattern matching, for name/email etc.
        const search = req.query.search;
        const searchFilter= {};

        if(search){
            searchFilter.name= {    // $regex-- pattern matching, $options-- ignore case
                $regex: search,
                $options: "i"
            }
        }

        tripList= await tripSchema.find(searchFilter);

        res.json({page,
                  limit,
                  data: tripList
        })
    }catch(error){
        next(error);
    }
}

exports.deleteTrip= async(req,res) => {  //authorized access for specific roles only
    console.log(req.body);
    const deleteUser= await tripSchema.findByIdAndDelete(req.body.id);
    return res.json({
        message: "Trip is deleted",
        user: deleteUser
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