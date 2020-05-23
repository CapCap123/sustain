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

app.get("/",function(req,res){
  res.sendFile(path + "index.html");
  console.log('html file sent');

});

scraper = require('./scraper.js');
recordBusiness = require ('./firebase');
//recordBrand = require ('./firebase');

const admin = require('firebase-admin');
var firestore = admin.firestore()

var businesses = [];

router.post("/api/businesses/save", function(req,res){
  var business = {};
  var brand = {};

  brandname = req.body.brandname;
  console.log('check brandname: ' + brandname);

// look if we know the brand
  checkBrand(brandname);

  function checkBrand (brandname) {
    quickstartQuery(firestore);
    return(brandname)
  }
  
  function quickstartQuery(firestore) {
    let brandQuery = firestore.collection('brands').where('Brands', 'array-contains',  brandname);
    brandQuery.get().then(function(querySnapshot) {

    if (querySnapshot.empty) { // if brand does not exist
      console.log('brand does not exist in db');
      brand.name = brandname;
      brand.small_business = 'new';
      scraper(brandname,brand,business);
      setTimeout(recordBusinessData, 10000);
      //setTimeout(recordBrandData, 10000);
      console.log('scraper and timer started');

    } else { querySnapshot.forEach(doc => { //if brand exists
          console.log(doc.id, '=>', doc.data());
          
          let esgRef = doc.data().business_ref; // get details on the brand
          let smallBusiness = doc.data().small_business;
          let esgSource = doc.data().esg_source;

          let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  esgRef)
          businessQuery.get().then(function(querySnapshot) {

          if (querySnapshot.empty) { // if business data does not exist
            if (smallBusiness == 'no') { // if it's a large business
              if(esgSource == '') {      // if no data
                console.log('no esg data available for this large business');
                business = {name: brandname, esg_data: null, small_business: smallBusiness}
              } else {                   // if we dont know, scrap
              scraper(brandname,brand,business);
              setTimeout(recordBusinessData, 10000); 
              console.log('scraper and timer started');
              }
            } else { // if it is not a large business
              console.log('this is a small business');
              business = {name: brandname, esg_data: null, small_business: smallBusiness}
            }
          } else { querySnapshot.forEach(doc => { //if brand and business exist
              console.log(doc.id, '=>', doc.data());
              business = doc.data(doc.id);
                });
              }
          });

        })
      }
      businesses.push(business);
    })
  }

  // register data in firestore once scrapped
    function recordBusinessData()  {
      if (!business.yahoo_uid) {
      businesses.push(brand);     
      console.log('no business data to record for: ' +JSON.stringify(brand));  
      } else {
      businesses.push(business); 
      console.log('business to be recorded: ' +JSON.stringify(business));
      recordBusiness(business);
      console.log('busines data recorded')
      }
      return(business);
      }
    
    res.json(business);
});

/*
function recordBrandData()  {
  console.log('brand to be recorded: ' +JSON.stringify(brand));
  recordBrand(brand);
  console.log('brand data recorded')
  return(brand);
  }
  */

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