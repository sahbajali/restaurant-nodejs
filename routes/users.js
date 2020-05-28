var express = require('express');
const bodyParser=require('body-parser');
var User=require('../models/user');
var router = express.Router();
router.use(bodyParser.json());
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
  
});

router.post('/signup', (req, res, next)=> {
  User.findOne({username:req.body.username})//here User is the database model
  .then((user)=>{ //here user contains One user object becoz thats what findOne returns
    if(user!=null){
      var err=new Error('User '+req.body.username+' already exists');
      err.status=403;
      next(err);
    }
    else{//here admin is by deffault set to false. so leaving it like that
      return User.create({username:req.body.username,password:req.body.password});
    }
  })
  .then((user)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json({status:'Registration Successful!',user:user});
    //here :user is an object that contains username, pwd, admin property.
  },(err)=>next(err))
  .catch((err)=>next(err));
});

router.post('/login',(req,res,next)=>{
  if(!req.session.user){
    var authHeader=req.headers.authorization;//authorization is a property in header
    //console.log(req.headers);
    //req.headers has four props: authorization, accept, host, connection
    if(!authHeader){
      var err=new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate','Basic');
      err.status=401;
      
      return next(err);
    }//crossing this if block means authHeader is not null
    //authHeader is in the form of "Basic abcehhruhdjdrhch="
    var auth=new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
    //on conversion username and pwd is in the form of username:password
    var usern=auth[0];
    var pwd=auth[1];
    User.findOne({username:usern})
    .then((user)=>{
      if(user===null){
        var err=new Error('User '+usern+' does not exist!');
        err.status=403;
        next(err);
      }
      else if(user.password!==pwd){
        var err=new Error('Your password is incorrect!');
        err.status=403;
        next(err);
      }
      else if(user.username===usern&&user.password===pwd){//could have given only else
        req.session.user='authenticated';
        res.statusCode=200;
        res.setHeader('Content-Type','text/plain');
        res.end('You are authenticated!');
      }
    })
    .catch((err)=>next(err));
  }
  else{
    res.statusCode=200;
        res.setHeader('Content-Type','text/plain');
        res.end('You are already authenticated!');
  }
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
