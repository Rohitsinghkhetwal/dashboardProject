const express = require('express');
require('./db/config');
const user = require('./db/users');
const products = require('./db/Product')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwtkey = "login-comm"


const app = express();
app.use(express.json())
app.use(cors())


app.post('/register', async (req, resp) => {
   let data = new user(req.body)
   let result =  await data.save();
   result = result.toObject();
   delete result.password;
   jwt.sign({result}, jwtkey, {expiresIn:"2h"}, (error, token) => {
    if(error) {
        resp.send({result: "Something went wrong"})

    }
    resp.send({result, auth: token});

})
})


app.post('/login', async(req, resp) => {
    let UserData = await user.findOne(req.body).select("-password"); 

    if(req.body.email && req.body.password) {
        if(UserData) {
            jwt.sign({UserData}, jwtkey, {expiresIn:"2h"}, (error, token) => {
                if(error) {
                    resp.send({result: "Something went wrong"})

                }
                resp.send({UserData, auth: token});

            })
           
        } else{
            resp.send({result: "NO_DATA_FOUND"})
        }

    } else {
        resp.send({result: "NO_DATA_FOUND"})
    }
})

app.post("/add-product", async (req, resp) =>{
    let product =  new products(req.body);
    let result = await product.save(); 
    resp.send(result);
    console.log(result);
   
})

app.get('/products', async (req, resp) => {
    let product = await products.find();
    if(product.length > 0) {
        resp.send(product);
    } else {
        resp.send({result: "NO_DATA_FOUND"})
    }
})

app.delete('/product/:id',async (req, resp) => {
    let items = await products.deleteOne({_id:req.params.id})
    resp.send(items);
})

app.get('/product/:id', async (req, resp) => {
    let result = await products.findOne({_id: req.params.id});
    if(result) {
        resp.send(result)
    } else {
        resp.send({result: "NO_DATA"})
    }
})

app.put('/product/:id', async (req, resp) => {
    let result = await products.updateOne(
        {_id: req.params.id}, {
            $set: req.body
        }
    )

    resp.send(result);
    
})

app.get("search/:key",  async(req, resp) => {
    let result = await products.find({
        "$or":[
            {name: {$regex: req.params.key}},
            {category: {$regex: req.params.key}},
            {company: {$regex: req.params.key}}
        ]
    });
    resp.send(result);
})








app.listen(5000);