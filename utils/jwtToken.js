// generate token and send token
const sendToken = (user,statusCode,res)=>{
    //create jwtToken
    const token = user.getJwtToken();
    //options for cookie
    const options = {
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRES_TIME * 24*60*60*1000),
        httpOnly:true
    }

    // if(process.env.NODE_ENV === 'production'){
    //     options.secure = true;
    // }
    
    res.status(statusCode)
    .cookie('token',token,options)
    .json({
        success:true,
        token
    });
}

module.exports= sendToken;