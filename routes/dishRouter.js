const express=require('express');
const bodyParser=require('body-parser');
const dishRouter=express.Router();
const mongoose=require('mongoose');//need to import in order to work with db
const Dishes=require('../models/dishes');//need to import to work with model class dish
dishRouter.use(bodyParser.json());//parses the body of the post request coming in

dishRouter.route('/')
.get((req,res,next)=>{
    //res.end('Will send all the dishes to you!');
    Dishes.find({})
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    //res.end('Will add the dish: '+req.body.name+' with details: '+req.body.description);
    Dishes.create(req.body)
    .then((dish)=>{
        console.log('Dish created ',dish);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put((req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /dishes');
})
.delete((req,res,next)=>{
    //res.end('deleting all the dishes');
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});
dishRouter.route('/:dishId')
.get((req,res,next)=>{
    //res.end('Will send details of the dish: '+req.params.dishId+' to you!');
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId);
})
.put((req,res,next)=>{
    /*res.write('Updating the dish: '+req.params.dishId+'\n');
    res.end('Will update the dish: '+req.body.name+' with details: '+req.body.description);
    */
   Dishes.findByIdAndUpdate(req.params.dishId,{$set:req.body},{new :true})
   .then((dish)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(dish);

   },(err)=>next(err))
   .catch((err)=>next(err));
})
.delete((req,res,next)=>{
    //res.end('deleting  dish: '+req.params.dishId);
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);

   },(err)=>next(err))
   .catch((err)=>next(err));
});
module.exports=dishRouter;