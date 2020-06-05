var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session =require('express-session');
var FileStore=require('session-file-store')(session);
var passport=require('passport');
var authenticate=require('./authenticate');
var config=require('./config');

const Dishes=require('./models/dishes');//importing Dishes schema
const mongoose=require('mongoose');//importing mongoose to manipulate end to end
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter=require('./routes/dishRouter');
var leaderRouter=require('./routes/leaderRouter');
var promoRouter=require('./routes/promoRouter');
var uploadRouter=require('./routes/uploadRouter');
var favoriteRouter=require('./routes/favoriteRouter');
var app = express();

///redirecting all secure requests to 3443
app.all('*', (req, res, next) => {
  if (req.secure) {
    return next();
  }
  else {
    //redirecting 3000 to 3443
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url);
  }
});

//const url='mongodb://localhost:27017/conFusion';//conFusion is the name of the db
const url=config.mongoUrl;//using config centrally for storing the configs
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
//app.use(cookieParser('1234567890-0987654321'));
app.use(passport.initialize());

app.use('/', indexRouter);//localhost:3000/
app.use('/users', usersRouter);//localhost:3000/users/

app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload',uploadRouter);
app.use('/favorites',favoriteRouter);
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