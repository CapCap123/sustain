/*
var express = require("express");
var app = express();

var http = require('http');

scraper = require('../findpage');

app.use(express.urlencoded());

const port = 3000
const server = http.createServer((req, res) => {
res.statusCode = 200
res.setHeader('Content-Type', 'text/plain')
res.end('Hello World\n')
})

server.listen(port, () => {
console.log(`Server running at http://${hostname}:${port}/`)
})
    //post
    const data = JSON.stringify({
    todo: 'Buy the milk'
    })

    const options = {
    hostname: 'localhost',
    port: 3000,
    path: __dirname + '/views/',
    method: 'POST',
    headers: {
    Making HTTP requests
    132
    'Content-Type': 'application/json',
    'Content-Length': data.length
    }
    }

    app.post('/submit-form', (req, res) => {
        const business = {}
        business.reqname = req.body.businessname
        scraper(req.body.businessname, business);
        res.end()
        })

    const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', (d) => {
    process.stdout.write(d)
    })
    })
    req.on('error', (error) => {
    console.error(error)
    })
    req.write(data)
    req.end()


    //get
const options = {
    hostname: 'localhost',
    port: 3000,
    path: __dirname + '/views/',
    method: 'GET'
    }

    const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
    res.on('data', (d) => {
    process.stdout.write(d)
    })
    })

    req.on('error', (error) => {
    console.error(error)
    })

    req.end()
 
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());


 

 
var path = __dirname + '/views/';
 
var businesses = [];
 
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});
 
app.get("/",function(req,res){
  res.sendFile(path + "index.html");
  console.log('html file sent');

});

router.post("/api/businesses/save", function(req,res){
  console.log('Post a Business: ' + JSON.stringify(req.body));
  var business = {};
  business.businessname = req.body.businessname;
  scraper(business.businessname,business);
  
  businesses.push(business);
  
  res.json(business);
});
 
app.get("/api/businesses/all", function(req,res){
  console.log("Get All Businesses" + JSON.stringify(businesses));
  res.json(businesses);
});
 
app.use("/",router);
 

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});
 
app.listen(8081, function () {
  console.log('Listening on port 8081!')
})
*/