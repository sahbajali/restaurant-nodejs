var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var passport=require('passport');
var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  
});

router.post('/signup', (req, res, next)=> {
  User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
    if(err){
      res.statusCode=500;
      res.setHeader('Content-Type','application/json');
      res.json({err:err});
    }
    else{
      passport.authenticate('local')(req,res,()=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json({success:true,status:'Registration Successful!'});//shown in msg body
      }); //end of authenticate
    } //end of else
  }) //end of register
}); //end of post

router.post('/login',passport.authenticate('local'),(req,res)=>{
  res.statusCode=200;//login by providing usname and pwd in req body instd of authorztn
  res.setHeader('Content-Type','application/json');
  res.json({success:true,status:'You are successfully logged in!'});
});

router.get('/logout',(req,res)=>{
  if(req.session){
    req.session.destroy();//info is removed form server side
    res.clearCookie('session-id');//asking client to delete the cookie in reply msg
    res.redirect('/');
  }
  else{
    var err=new Error('You are not logged in!');
    err.statusCode=403;
    next(err);
  }
});
module.exports = router;
