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

const admin = require('firebase-admin');
var firestore = admin.firestore()

var businesses = [];

router.post("/api/businesses/save", function(req,res){
  var business = {};

  brandname = req.body.brandname;
  console.log('test brandname ' + brandname);

// look if we know the brand
  checkBrand(brandname);

  function checkBrand (brandname) {
    quickstartQuery(firestore);
    return(brandname)
  }
  
  function quickstartQuery(firestore) {
    let brandQuery = firestore.collection('brands').where('Brands', 'array-contains',  brandname);
    brandQuery.get().then(function(querySnapshot) {
    if (querySnapshot.empty) {
      console.log('empty query');
      getData(brandname,business);    

    } else { querySnapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  doc.id)

          businessQuery.get().then(function(querySnapshot) {
          if (querySnapshot.empty) {
            console.log('business data empty');
            getData(brandname,business);
          } else { querySnapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                business = doc.data(doc.id);
                console.log('retrieved data: ' + JSON.stringify(business));
                getData(brandname,business);
                });
              }
          });

        })
      }
    })
  }

  function getData(brandname,business) {
  if(!business.yahoo_uid) {
      scraper(brandname,business)
      setTimeout(displayData, 10000)
      console.log('timer started to record data after scraping')
      } else {
      console.log('business already exists')
      businesses.push(business); 
      }
    return(business)
  }

  // register data in firestore once scrapped
    function displayData()  {
      businesses.push(business); 
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