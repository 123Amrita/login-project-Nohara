//===========================================Global Error handler===================================================

//we will be using this in places to handle error instead
function errorHandler(err, req, res, next){
    console.error(err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    })
}

module.exports= errorHandler;