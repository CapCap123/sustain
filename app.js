var express = require("express");
var app = express();
var router = express.Router();

var bodyParser = require('body-parser');
app.use(bodyParser.json());

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

app.use(express.static('public'));
var path = __dirname + '/views/';

var businesses = [];

app.get("/",function(req,res){
  res.sendFile(path + "index.html");
  console.log('html file sent');

});

scraper = require('./scraper.js');

router.post("/api/businesses/save", function(req,res){
  var business = {};
  business.brandname = req.body.businessname;
  reqname = business.brandname
  console.log('data in js before scraping '+JSON.stringify(business)); //data ready {"brandname":"google"}

  scraper(business.brandname,business)

  businesses.push(business); 

    res.json(business);
});

router.get("/api/businesses/all", function(req,res){
  console.log("Get all businesses in js" + JSON.stringify(businesses));
  return res.send(businesses);
});
 
app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});
 
app.listen(8081, function () {
  console.log('Listening on 8081')
})