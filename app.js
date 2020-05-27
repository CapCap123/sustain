var express = require("express");
const admin = require('firebase-admin');
var bodyParser = require('body-parser');

const yahooScraper = require('./scraperarchive.js');
const { saveBrand, saveBusiness } = require ('./firebase');


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

var firestore = admin.firestore()
var businesses = [];

router.post("/api/businesses/save", function(req,res){
  var business = {};
  var brand = {};

  brandname = req.body.brandname
  websiteName = brandname.toLowerCase().split(" ").join("");
  console.log('check brandname: ' + brandname);
  business.brandName = brandname;
  brand.name = brandname;

// look if we know the brand
  checkBrand(brandname);

  function checkBrand (brandname) {
    quickstartQuery(firestore);
    return brandname
  }
  
  function quickstartQuery(firestore) {
    let brandQuery = firestore.collection('brands').where('websites', 'array-contains',  websiteName);
    brandQuery.get().then(function(querySnapshot) {

    if (querySnapshot.empty) { // if brand does not exist, scrap everything
      console.log('brand does not exist in db');
      brand.name = brandname;
      brand.small_business = 'new';
      brand.website = websiteName;

      yahooScraper(brandname,brand,business);
      setTimeout(saveBusinessData, 10000);
      setTimeout(saveBrandData, 8000);

      console.log('scraper and timer started');
      console.log(JSON.stringify(businesses)+ ' db brand check')

    } else { querySnapshot.forEach(doc => { //if brand exists
          console.log(doc.id, '=>', doc.data());
          
          let esgRef = doc.data().business_ref; // get details on the brand
          brand.business_ref = esgRef;

          if (esgRef == '') {  //if brand has no business_ref, stop
            business = {name: brandname}
            businesses.push(business);
            console.log(JSON.stringify(businesses)+ ' db brand no business ref')
            console.log('no esg data available for this brand' + JSON.stringify(business));

          } else {  // if brand has esg ref
            let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  esgRef)
            businessQuery.get().then(function(querySnapshot) { 
              if (querySnapshot.empty) {  // brand has esg ref but no corresponding business data
                business.yahoo_uid = esgRef;
                yahooScraper(brandname,brand,business);
                setTimeout(saveBusinessData, 10000);
                console.log(' db brand business ref, no ref found')

              } else { //if brand and business exist
              querySnapshot.forEach(doc => { 
              console.log(doc.id, '=>', doc.data());
              business = doc.data(doc.id);
              business.brandName = brandname;
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
    return res.send(business);
  }

    //functions to record in firestore
    function saveBrandData()  {
      console.log('brand to be recorded: ' + JSON.stringify(brand));
      saveBrand(brand);
      console.log('brand data recorded')
    }

    function saveBusinessData() {  
      if (!business.yahoo_uid) {
      console.log('no business data to record for: ' +JSON.stringify(brand));  
      businesses.push(brand);
      } else {
      let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  business.yahoo_uid)
      businessQuery.get().then(function(querySnapshot) { 
          if (querySnapshot.empty) {
            console.log('business to be recorded: ' +JSON.stringify(business));
            saveBusiness(business);
            businesses.push(business);
            console.log('business data recorded')
          } else {
            console.log('business already exists in databse' + JSON.stringify(business));
          }
        })
      }
    }
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
})