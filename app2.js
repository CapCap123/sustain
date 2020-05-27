var express = require("express");
const admin = require('firebase-admin');
var bodyParser = require('body-parser');

const {yahooDataScraper, yahooCodeScraper} = require('./scraper.js');
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

router.post("/api/businesses/save", function(req,res){
  var business = {};
  var brand = {};

  brandname = req.body.brandname
  websiteName = brandname.toLowerCase().split(" ").join("");
  console.log('check brandname: ' + brandname);
  business.brandName = brandname;
  brand.name = brandname;
  brand.website = websiteName

// look if we know the brand
    checkBusinessRef(brand,business)

    async function checkBrand(websiteName,brand) {
        try {
        let brandQuery = firestore.collection('brands').where('websites', 'array-contains',  websiteName);
        brandQuery.get().then(function(brandSnapshot) {
            if (brandSnapshot.empty) { // if brand does not exist
                console.log('brand does not exist in db');
                brand.small_business = 'new';
                brand.website = websiteName;
            } else { 
                brandSnapshot.forEach(doc => { //if brand exists
                    var businessRef = doc.data().business_ref
                    if(!businessRef) {
                        console.log('this brand has no business ref')
                    } else{
                        brand.business_ref = businessRef
                        console.log('brand exists and has business ref')
                    }
                })
            }
        })
        } catch(error) {
            console.log(error)
        }
    console.log(brand)
    return brand;
    }

    async function checkBusinessRef(brand) {
    try {
        var matchedBrand = await checkBrand(brand.website,brand) 
        if (!matchedBrand.business_ref) {
            matchedBrand.business_ref = await yahooCodeScraper(brand);
            console.log('scraper for code launched')
        } else {
            console.log('this brand already has a business ref')
        }
    } catch(error){
        console.log(error)
    }
    return matchedBrand.business_ref
    }

    /*
    async function checkBusinessData(brand,business) {
        try {   
            var yahooCode = await checkBusinessRef(brand)
            businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  await yahooCode)
            businessQuery.get().then(function(businessSnapshot) {
                if (businessSnapshot.empty) {
                    console.log('scraper for business launched')
                   // scrapedBusiness = await yahooDataScraper(business)
                } else {
                    business = doc.data()
                    console.log('this business already exists in DB')
                }
            })
        } catch(error) {
            console.log(error);
        }
        console.log(business)
        return business
    }
    */
})

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

    /*
  
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
*/