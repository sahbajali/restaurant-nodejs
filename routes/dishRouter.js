const express=require('express');
const bodyParser=require('body-parser');
const dishRouter=express.Router();
const mongoose=require('mongoose');//need to import in order to work with db
const authenticate=require('../authenticate');
const cors =require('./cors');
const Dishes=require('../models/dishes');//need to import to work with model class dish
dishRouter.use(bodyParser.json());//parses the body of the post request coming in
const Users=require('../models/user');
dishRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Dishes.find({})
    .populate('comments.author')
    .then((dishes)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dishes);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    Dishes.create(req.body)
    .then((dish)=>{
        console.log('Dish created ',dish);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /dishes');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next)=>{
    Dishes.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});
dishRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(dish);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=>{
   Dishes.findByIdAndUpdate(req.params.dishId,{$set:req.body},{new :true})
   .then((dish)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(dish);

   },(err)=>next(err))
   .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next)=>{
    //res.end('deleting  dish: '+req.params.dishId);
    Dishes.findByIdAndRemove(req.params.dishId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);

   },(err)=>next(err))
   .catch((err)=>next(err));
});
//handling comments from here*************************************************************************

dishRouter.route('/:dishId/comments')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments);
        }
        else{
            err=new Error('Dish '+req.params.id+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){
            req.body.author=req.user._id;//getting user from verifyUser after verifctn
            dish.comments.push(req.body);
            dish.save()
            .then((dish)=>{
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish);
                    })
                
            },(err)=>next(err))
            .catch((err)=>next(err));  
        }
        else{
            err=new Error('Dish '+req.params.dishId+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin, (req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /dishes/'+req.params.dishId+'/comments');
})
.delete(cors.corsWithOptions, authenticate.verifyUser,authenticate.verifyAdmin,(req,res,next)=>{
    //no one should be able to delete all comments except admin
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null){
            for(var i=dish.comments.length-1;i>=0;i--){
                dish.comments.id(dish.comments[i]._id).remove();
            }
            //dish.comments=[];
            dish.save()
            .then((dish)=>{
                res.statusCode=200;
                res.setHeader('Content-Type','application/json');
                res.json(dish);
            },(err)=>next(err))
            .catch((err)=>next(err)); 
        }
        else{
            err=new Error('Dish '+req.params.id+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});
//handling individual comments by commentId**********************************************************
dishRouter.route('/:dishId/comments/:commentId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Dishes.findById(req.params.dishId)
    .populate('comments.author')
    .then((dish)=>{
        if(dish!=null&&dish.comments.id(req.params.commentId)!=null){
            res.statusCode=200;
            res.setHeader('Content-Type','application/json');
            res.json(dish.comments.id(req.params.commentId));
        }
        else if (dish==null){
            err=new Error('Dish '+req.params.id+' not found');
            err.status=404;
            return next(err);
        }
        else{
            err=new Error('Comment '+req.params.commentId+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /dishes/'+req.params.dishId+'/comments/'+req.params.commentId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{
    
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        if(dish!=null && dish.comments.id(req.params.commentId)!=null){
            var uid=JSON.stringify(req.user._id);
            var cid=JSON.stringify(dish.comments.id(req.params.commentId).author);
            if(uid==cid){
                if(req.body.rating){
                    Dishes.findOneAndUpdate({"_id":req.params.dishId,"comments._id":req.params.commentId},
                    {$set:{"comments.$.rating":req.body.rating}});
                }
                if(req.body.comment){
                    Dishes.findOneAndUpdate({"_id":req.params.dishId,"comments._id":req.params.commentId},
                    {$set:{"comments.$.comment":req.body.comment}});
                }
                /*remoting this becoz its not working 
                if(req.body.rating){
                    dish.commments.id(req.params.commentId).rating=req.body.rating;
                }
                if(req.body.comment){
                    dish.commments.id(req.params.commentId).comment=req.body.comment;
                }*/
                dish.save()
                .then((dish)=>{
                    Dishes.findById(dish._id)
                        .populate('comments.author')
                        .then((dish)=>{
                            res.statusCode=200;
                            res.setHeader('Content-Type','application/json');
                            res.json(dish.comments);
                        })
                
                },(err)=>next(err))
                .catch((err)=>next(err)); 
            }
            else{
                err=new Error('You are not the authorized to update this comment!');
                err.status=403;
                return next(err);
            }
            
        }
        else if (dish==null){
            err=new Error('Dish '+req.params.id+' not found');
            err.status=404;
            return next(err);
        }
        else{
            err=new Error('Comment '+req.params.commentId+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req,res,next)=>{//while deleting jwt is authing
    Dishes.findById(req.params.dishId)
    .then((dish)=>{
        var uid=req.user._id;
        var cid=dish.comments.id(req.params.commentId).author;
        if(cid.equals(uid)){
            dish.comments.id(req.params.commentId).remove();
            dish.save()
            .then((dish)=>{
                Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish)=>{
                        res.statusCode=200;
                        res.setHeader('Content-Type','application/json');
                        res.json(dish);
                    })
            },(err)=>next(err))
            .catch((err)=>next(err)); 
        }
        else if(!cid.equals(uid)){
            err=new Error('You are not the authorized to delete this comment');
            err.status=403;
            return next(err);
        }
        else{
            err=new Error('Dish '+req.params.id+' not found');
            err.status=404;
            return next(err);
        }
    },(err)=>next(err))
    .catch((err)=>next(err));
});

module.exports=dishRouter;
