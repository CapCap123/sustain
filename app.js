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

    if (querySnapshot.empty) { // if brand does not exist, scrap everything
      console.log('brand does not exist in db');
      brand.name = brandname;
      brand.small_business = 'new';
      scraper(brandname,brand,business);
      setTimeout(recordBusinessData, 10000);
      //setTimeout(recordBrandData, 10000);
      console.log('scraper and timer started');
      console.log(JSON.stringify(businesses)+ ' db brand check')

    } else { querySnapshot.forEach(doc => { //if brand exists
          console.log(doc.id, '=>', doc.data());
          
          let esgRef = doc.data().business_ref; // get details on the brand
          let smallBusiness = doc.data().small_business;
          //let esgSource = doc.data().esg_source;

          if (esgRef == '') {  //if brand has no business_ref, give up
            business = {name: brandname, small_business: smallBusiness}
            businesses.push(business);
            console.log(JSON.stringify(businesses)+ ' db brand no business ref')
            console.log('no esg data available for this brand' + JSON.stringify(business));
          } else {  // if brand has esg ref
            let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  esgRef)
            businessQuery.get().then(function(querySnapshot) { 
              if (querySnapshot.empty) { 
                scraper(esgRef,brand,business);
                setTimeout(recordBusinessData, 10000);
                console.log(JSON.stringify(businesses)+ ' db brand business ref, no ref found')
              } else {
              querySnapshot.forEach(doc => { //if brand and business exist
              console.log(doc.id, '=>', doc.data());
              business = doc.data(doc.id);
              console.log('new business in businesses: '+ JSON.stringify(business));
              console.log(JSON.stringify(businesses)+ ' db brand and business')
              businesses.push(business);
                });
              }
            })
          }
        })
      }
    })
    return(businesses);
  }


  // register data in firestore once scrapped
  function recordBusinessData()  {
    if (!business.yahoo_uid) {
    console.log('no business data to record for: ' +JSON.stringify(brand));  
    businesses.push(brand);
    } else {
    recordBusiness(business);
    console.log('business to be recorded: ' +JSON.stringify(business));
    businesses.push(business);
    console.log('business data recorded')
    }
    return(business);
  }
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