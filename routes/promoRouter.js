const express=require('express');
const bodyParser=require('body-parser');
const promoRouter=express.Router();
const Promo=require('../models/promo');
const authenticate=require('../authenticate');
const cors =require('./cors');
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Promo.find(req.query)
    .then((promos)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promos);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Promo.create(req.body)
    .then((promo)=>{
        console.log('Dish created ',promo);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /promotions');
})

.delete(cors.corsWithOptions, authenticate.verifyUser,(req,res,next)=>{
    Promo.remove({})
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);
    },(err)=>next(err))
    .catch((err)=>next(err));
});
/*
.delete((req,res,next)=> {
    Promo.deleteOne({})
    .then((resp)=>{
        res.statusCode = 200;
        res.setHeader("Content-Type","application/json");
        res.json(resp);
    }).catch((err) => {console.log(err)});
});
*/
promoRouter.route('/:promoId')
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200);})
.get(cors.cors, (req,res,next)=>{
    Promo.findById(req.params.promoId)
    .then((promo)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /promotions/'+req.params.promoId);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=>{
    Promo.findByIdAndUpdate(req.params.promoId,{$set:req.body},{new :true})
   .then((promo)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(promo);

   },(err)=>next(err))
   .catch((err)=>next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin,(req,res,next)=>{
    Promo.findByIdAndDelete(req.params.promoId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);

   },(err)=>next(err))
   .catch((err)=>next(err));
});


module.exports=promoRouter;
