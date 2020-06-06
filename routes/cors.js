const express=require('express');
const app=express();
const cors=require('cors');

const whiteList=['http://localhost:3000','https://localhost:3443','http://localhost:4200'];
//updating cors to work with port 4200 which is for angular client
var corsOptionsDelegate=(req,callback)=>{
    var corsOptions;
    if(whiteList.indexOf(req.header('Origin'))!=-1){
        corsOptions={origin:true};
    }
    else{
        corsOptions={origin:false};
    }
    callback(null,corsOptions);
};
exports.cors=cors();//reply with wildcard * mainly in case of get i will configure
exports.corsWithOptions=cors(corsOptionsDelegate);