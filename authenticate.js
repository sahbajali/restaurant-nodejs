var passport=require('passport');
var LocalStrategy=require('passport-local').Strategy;
var User=require('./models/user');
var JwtStrategy=require('passport-jwt').Strategy;
var ExtractJwt=require('passport-jwt').ExtractJwt;
var jwt=require('jsonwebtoken');

var config=require('./config');

exports.local=passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken=function(user){//user will accept json
    //creates token
    return jwt.sign(user, config.secretKey, {expiresIn:3600});
    //user is payload/data, then the secretKey chosen in config file, the expiry in secs
}

var opts={};
opts.jwtFromRequest=ExtractJwt.fromAuthHeaderAsBearerToken();//how to extract the token
opts.secretOrKey=config.secretKey;
//where is this jwt_payload coming from although when req is made using only token??
exports.jwtPassport=passport.use(new JwtStrategy(opts,(jwt_payload,done)=>{
    console.log("JWT payload: ",jwt_payload);
    User.findOne({_id:jwt_payload._id},(err,user)=>{
        if(err){
            
            return done(err,false);//incase of err object is false
        }
        else if(user){
            
            return done(null, user);
        }
        else{
            
            return done(null,false);
        }
    });
}));
//verifyUser is using the jwtPassport created above to authenticate
exports.verifyUser=passport.authenticate('jwt',{session:false});
exports.verifyAdmin = function(req,res,next){
    if(req.user.admin ==true)  {
        return next();
    }else {
        var err=new Error("You are not authorized to perform this operation!");
        err.status=403;
        return next(err);
    }
};
/*
User.findOne({_id: req.user._id})
    .then((user) => {
        console.log("User: ", req.user);
        if (user.admin) {
            next();
        }
*/
//strategy is jwt and made session false becoz we wont create sessions.
//verifyUser can be used to verify user's authenticity just by using verifyUser
//it authenticates from the extracted token from 
//ExtractJwt.fromAuthHeaderAsBearerToken()