var express = require("express");
var bodyParser = require('body-parser');

const {saveBrandData} = require('./checkdata.js')

var app = express();
app.use(bodyParser.json());
var router = express.Router();

router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});

var path = __dirname + '/views/';
app.use(express.static('public'));
app.get("/",function(req,res){
  res.sendFile(path + "index.html");
  console.log('html file sent');
});

router.post("/api/businesses/save", function(req,res){
  var brand = {};

  brandname = req.body.brandname
  websiteName = brandname.toLowerCase().split(" ").join("");
  console.log('check brandname: ' + brandname);
  brand.name = brandname;
  brand.website = websiteName;

  saveBrandData(brand)
});

router.get("/api/businesses/all", function(req,res){
  console.log("Get all businesses in js" + JSON.stringify(businesses));
  res.send(businesses);
});
 
app.use("/",router);

app.use("*",function(req,res){
  res.sendFile(path + "404.html");
});
 
app.listen(8081, function () {
  console.log('Listening on 8081')
});