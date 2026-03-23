//==========================================For the middleware logic only==================================================
//for jwt token execution
const jwt= require('jsonwebtoken');

const SECRET_KEY= process.env.JWT_SECRETKEY;

//for roles based access only
exports.rolesMiddleware= (...allowedRoles) => {
    return (req, res, next) => {
        const user= req.user;
        if( !user || !allowedRoles.includes(user.role)) {
            return res.status(401).json({
                "message":"Unauthorized access"
            })
        }else{
            next()
        }
    }
}

//this is middleware for verifying the token on routes after logoin , only we can go to the routes if we have authorized token
exports.tokenMiddleware= (req, res, next) => {
    try{
        const token= req.headers.authorization?.split(" ")[1]; // we have to send Bearer "token" from postman for authorization, so we will split string to get the token
        if(token){
            const jwtToken= jwt.verify(token, SECRET_KEY) // using .verify(header-token, secretkey), this will decode the token to the userid and emailid
            if(jwtToken){
               req.user= jwtToken;
               next()
            }else{
               return res.status(401).json({
                "message":'Unauthorized access'
               })
            }
        }
    }catch(error){
        return res.status(401).json({
            "error":error,
            "message":'Unauthorized access'
           })
    }
}

//to check whether the user has given all credentials
exports.authMiddleWare= (req, res, next) => {
    if(req.body.name && req.body.password && req.body.emailId){
        next()
    }else{
        return res.status(400).json({
            "message":"Please fill all mandatory fields to signup"
        })
    }
}