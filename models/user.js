var mongoose=require('mongoose');
var passportLocalMongoose=require('passport-local-mongoose');
var Schema=mongoose.Schema;
var User=new Schema({
    //username and pwd property would be automatically updated by passportlocalmongoose
    admin:{
        type:Boolean,
        default:false
    }
});

User.plugin(passportLocalMongoose);
module.exports=mongoose.model('User',User);