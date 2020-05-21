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

recordBusiness = require ('./firebase');
//recordBrand = require ('./firebase');

router.post("/api/businesses/save", function(req,res){
  var brand = {};
  var business = {};

  brand.brandname = req.body.brandname;
  //brand.brandname = reqname;
  console.log('test brandname ' + brand.brandname);

  console.log('data in js before scraping '+JSON.stringify(brand)); //data ready {"brandname":"google"}

  scraper(brand,business)

  businesses.push(business); 

  if(!business.yahooData) {
    setTimeout(displayData, 7000)
    console.log('timer started')
    } else {
    displayData();
    console.log('timer not started')
    }

    function displayData()  {
    //recordBrand(brand);
    recordBusiness(business);
    console.log('data recorded')
    console.log(JSON.stringify(business) + JSON.stringify(brand));
    return(business);
    }
    
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