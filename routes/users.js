var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var passport=require('passport');
var authenticate=require('../authenticate');
const cors =require('./cors');
var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/',cors.corsWithOptions,  authenticate.verifyUser,authenticate.verifyAdmin, function(req, res, next) {
  //respond with all the users to the admin only
  var token=authenticate.getToken({_id:req.user._id});
  User.find({})
    .then((users)=>{
      /*.then((err, users) => {
            if (err) {
                return next(err);
            }*/
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(users);
      },(err)=>next(err))
    .catch((err)=>next(err));
  });

router.post('/signup',cors.corsWithOptions,  (req, res, next)=> {
  User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
    if(err){
      res.statusCode=500;
      res.setHeader('Content-Type','application/json');
      res.json({err:err});
    }
    else{
      if(req.body.firstname){
        user.firstname=req.body.firstname;
      }
      if(req.body.lastname){
        user.lastname=req.body.lastname;
      }
      user.save((err,user)=>{
        if(err){
          res.statusCode=500;
          res.setHeader('Content-Type','application/json');
          res.json({err:err});
          return;
        }
        passport.authenticate('local')(req,res,()=>{
          res.statusCode=200;
          res.setHeader('Content-Type','application/json');
          res.json({success:true,status:'Registration Successful!'});//shown in msg body
        }); //end of authenticate
      });//end of save
    } //end of else
  }) //end of register
}); //end of post

router.post('/login',cors.corsWithOptions, passport.authenticate('local'),(req,res)=>{
  //when passport.authenticate auths the user, it will load the user in req
  var token=authenticate.getToken({_id:req.user._id});//making token using id
  res.statusCode=200;//login by providing usname and pwd in req body instd of authorztn
  res.setHeader('Content-Type','application/json');
  res.json({success:true, token: token, status:'You are successfully logged in!'});
});//passing token in the response body

router.get('/logout',(req,res,next)=>{
  /*if(req.session){
    req.session.destroy();//info is removed form server side
    res.clearCookie('session-id');//asking client to delete the cookie in reply msg
    res.redirect('/');
  }
  else{
    var err=new Error('You are not logged in!');
    err.statusCode=403;
    next(err);
  }*/
  req.logout();
  res.redirect('/');
});
module.exports = router;