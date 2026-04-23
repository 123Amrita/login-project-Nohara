require('dotenv').config({
    path: './environments/local.env'    //we have to import the exact enviornment file in here
});

const dns= require('dns');
dns.setServers(["1.1.1.1", "8.8.8.8"]);
const connectDB= require('./config/db.js');
const cors= require('cors');

//to use port from env files only
const PORT= process.env.PORT;

//for nodejs is running or not
const express= require('express');

const errorHandler= require('./middleware/error.middleware.js');

const app= express();
app.use(express.json()); //this is the middleware (A function that runs before the request reaches your route)
app.use(cors()); //this will allow cross-origin requests.We can either allow all origins/restrict to specific frontend URLs.

app.get("/test", (req,res)=> {
    console.log("Test route hit")
    res.send("Server working")
})

connectDB(); //need to call this in here to connect the db.js file to server.js

//for connecting routes
app.use("/api/auth", require("./routes/auth.routing.js"));

//We have to write this errorHandler in server too, so that we can use it inside controller logics
app.use(errorHandler);

//always have to write this line at last of the page, as this is the server starting line
app.listen(PORT, () =>{
    console.log("Server running on port ${PORT}")
})

