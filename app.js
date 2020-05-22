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
  var business = {};

  brandname = req.body.brandname;
  console.log('test brandname ' + brandname);

  scraper(brandname,business)
  businesses.push(business); 

  if(!business.yahooData) {
    setTimeout(displayData, 8000)
    console.log('timer started')
    } else {
    displayData();
    console.log('timer not started')
    }

    function displayData()  {
      console.log(JSON.stringify(business));
      recordBusiness(business);
      //recordBrand(brand);
      console.log('data recorded')
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