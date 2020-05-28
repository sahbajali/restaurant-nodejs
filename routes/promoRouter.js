const express=require('express');
const bodyParser=require('body-parser');
const promoRouter=express.Router();
const Promo=require('../models/promo');
const authenticate=require('../authenticate');
promoRouter.use(bodyParser.json());

promoRouter.route('/')
.get((req,res,next)=>{
    Promo.find({})
    .then((promos)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promos);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post(authenticate.verifyUser,(req,res,next)=>{
    Promo.create(req.body)
    .then((promo)=>{
        console.log('Dish created ',promo);
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.put(authenticate.verifyUser,(req,res,next)=>{
    res.statusCode=403;
    res.end('PUT operation not supported on /promotions');
})

.delete(authenticate.verifyUser,(req,res,next)=>{
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
.get((req,res,next)=>{
    Promo.findById(req.params.promoId)
    .then((promo)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(promo);
    },(err)=>next(err))
    .catch((err)=>next(err));
})
.post((req,res,next)=>{
    res.statusCode=403;
    res.end('POST operation not supported on /promotions/'+req.params.promoId);
})
.put((req,res,next)=>{
    Promo.findByIdAndUpdate(req.params.promoId,{$set:req.body},{new :true})
   .then((promo)=>{
    res.statusCode=200;
    res.setHeader('Content-Type','application/json');
    res.json(promo);

   },(err)=>next(err))
   .catch((err)=>next(err));
})
.delete((req,res,next)=>{
    Promo.findByIdAndDelete(req.params.promoId)
    .then((resp)=>{
        res.statusCode=200;
        res.setHeader('Content-Type','application/json');
        res.json(resp);

   },(err)=>next(err))
   .catch((err)=>next(err));
});


module.exports=promoRouter;
