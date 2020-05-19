var express = require("express");
var app = express();
 
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

scraper = require('./findpage');
 
app.use(express.static('public'));
 
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
  
  return res.send(business);
});
 
app.get("/api/businesses/all", function(req,res){
  console.log("Get All Businesses" + JSON.stringify(businesses));
  return res.send(businesses);
});
 
app.use("/",router);
 

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});
 
app.listen(8081, function () {
  console.log('Listening on port 8081!')
})