var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const Dishes=require('./models/dishes');//importing Dishes schema
const mongoose=require('mongoose');//importing mongoose to manipulate end to end
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter=require('./routes/dishRouter');
var leaderRouter=require('./routes/leaderRouter');
var promoRouter=require('./routes/promoRouter');
var app = express();

const url='mongodb://localhost:27017/conFusion';//url for the db;conFusio is the name of the db
const connect=mongoose.connect(url);
connect.then((db)=>{
  console.log('Connected correctly to the Server');
},(err)=>console.log(err));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

function auth(req,res,next) {
  console.log(req.headers);
  var authHeader=req.headers.authorization;//authorization is a property in header
  if(!authHeader){
    var err=new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate','Basic');
    err.status=401;
    next(err);
    return;
  }
  var auth=new Buffer.from(authHeader.split(' ')[1],'base64').toString().split(':');
  var user=auth[0];
  var pass=auth[1];
  if(user==='admin'&&pass==='password'){
    next();
  }
  else{
    var err=new Error('You are not authenticated!');
    res.setHeader('WWW-Authenticate','Basic');
    err.status=401;
    next(err);
  }
}
app.use(auth);//adding authentication to the app.auth is the name of the function
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
//mongod --dbpath=data --bind_ip 127.0.0.1