const express=require('express');
const bodyParser=require('body-parser');
const favoriteRouter=express.Router();
const mongoose=require('mongoose');//need to import in order to work with db
const authenticate=require('../authenticate');
const cors =require('./cors');
const Dishes=require('../models/dishes');//need to import to work with model class favorite
favoriteRouter.use(bodyParser.json());//parses the body of the post request coming in
const Users=require('../models/user');
const Favorites=require('../models/favorite');

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .populate('user')//edit it later
    .populate('dishes')
    .then((favs)=>{
        if(favs==null){
            err=new Error("Your favorite list is empty!");
            next(err);
        }
        else{
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(favs);
        }
        
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({"user":req.user._id})
    .then((favs)=>{
        if(favs){
            var arr=[];
            var dsh;
            for(key in req.body){
                dsh=req.body[key]._id;
                if(favs.dishes.indexOf(dsh)==-1)//checking if id is already present or not
                    arr=arr.concat(dsh);

            }
            favs.dishes=favs.dishes.concat(arr);
            favs.save()
            .then((favs)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else{
            var arr=[];
            var dsh;
            for(key in req.body){
                dsh=req.body[key]._id;
                if(favs==null || favs.dishes.indexOf(dsh)==-1)//had to check for null first else it will show dishes not found in null
                    arr=arr.concat(dsh);
            }
            Favorites.create({user:req.user._id,dishes:arr})
            .then((favs)=>{
                favs.save();
                //console.log('Favorites created ',favs);
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
    },(err)=>next(err))
        .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Favorites.find({user:req.user._id})
    .then((favs)=>{
        if(favs!=null){
            Favorites.remove({"user":req.user._id})
            .then((favs)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.end("Favorite Dishes deleted! Favorite list is now empty");
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else{
            err=new Error("Favorite list is already empty!");
            res.statusCode=403;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('GET operation not supported on /favorites/'+req.params.dishId);
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favs)=>{
        console.log(favs);
        if(favs==null){
            Favorites.create({user:req.user._id,dishes:req.params.dishId})
            .then((favs)=>{
                console.log('Favs created ',favs);
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else if(favs.dishes.indexOf(req.params.dishId)==-1){
            favs.dishes.push(req.params.dishId);
            favs.save()
            .then((favs)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err))
            .catch((err)=>next(err));   
        }
        else{
            err=new Error("You have already added this dish in favorite list!");
            res.statusCode=403;
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Favorites.findOne({user:req.user._id})
    .then((favs)=>{
        if(favs.dishes.length==1&&favs.dishes.indexOf(req.params.dishId)!=-1){
            favs.remove()
            .then((favs)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.end("Dish deleted! Favorite list is now empty");
            },(err)=>next(err))
            .catch((err)=>next(err));
        }
        else if(favs.dishes.length>0 && favs.dishes.indexOf(req.params.dishId)!=-1){
            //delete favs.dishes[favs.dishes.indexOf(req.params.dishId)];
            favs.dishes.splice(favs.dishes.indexOf(req.params.dishId),1);
            favs.save()
            .then((favs)=>{
                
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(favs);
            },(err)=>next(err))
            .catch((err)=>next(err));  
        }
        else{
            err=new Error("This dish is not present in your fav list!");
            res.statusCode=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});
module.exports=favoriteRouter;