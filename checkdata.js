
const admin = require('firebase-admin');
const {yahooScraper, yahooCodeScraper} = require('./scraper.js');
const { saveBrand, saveBusiness } = require ('./firebase');

var firestore = admin.firestore()

// functions checking in database and requesting scraper as needed
async function checkBrand(brand) {
    try {
    let websiteName = brand.website
      let brandQuery = firestore.collection('brands').where('websites', 'array-contains',  websiteName);
      let querySnapshot = await brandQuery.get()
      if (querySnapshot.empty) {
        console.log('brand does not exist in db');
        brand.new_brand = true;        
      } else {
        brand.new_brand = false;     
        querySnapshot.forEach(doc => { //if brand exists
          var businessRef = doc.data().business_ref
          var businessName = doc.data().business_name
          if((!businessRef) || businessRef.empty) {
            console.log('this brand has no business ref')
            brand.hasEsg = false;
            brand.business_ref = ""      
          } else{
            brand.business_ref = businessRef
            brand.business_name = businessName
            brand.hasBusiness_ref == true
            console.log('brand exists and has business ref')
          }
        })
      }
    } catch(error) {
      console.log(error)
    }

  console.log(JSON.stringify(brand))
  return brand;
  }

  async function checkBusinessRef(brand) {
    try {
      var matchedBrand = await checkBrand(brand) 
      var newBrand = await matchedBrand.new_brand
        if (newBrand == true) {
            yahooCode = await yahooCodeScraper(brand);
            matchedBrand.business_ref = yahooCode;
            console.log('scraper for code launched')
        } else {
            console.log('no need to launch code scraper')
        }
    } catch(error){
      console.log(error)
    }
    console.log('matched brand' + JSON.stringify(matchedBrand))
    return matchedBrand
  }
  
  async function checkBusinessData(brand) {
    try {   
      var matchedBrand = await checkBusinessRef(brand)
      var yahooCode = await matchedBrand.business_ref
      console.log('yahoo code is' + yahooCode)
      saveBrandData(await matchedBrand);
      if (yahooCode.length < 1) {
        console.log('no business ref found for this brand')
        scrapedBusiness = matchedBrand
        scrapedBusiness.new_business = false
        scrapedBusiness.hasBusiness_ref = false
        scrapedBusiness.hasEsg = false
      } else {
        matchedBrand.hasBusiness_ref = true
        let businessQuery = firestore.collection('businesses').where('yahoo_uid', '=',  yahooCode)
        let businessSnapshot = await businessQuery.get()          
        if (businessSnapshot.empty) {
          console.log('scraper for business launched')
          scrapedBusiness = await yahooScraper(matchedBrand)
          saveBusinessData(await scrapedBusiness)
        } else { businessSnapshot.forEach(doc => {
          scrapedBusiness = doc.data(doc.id)
          scrapedBusiness.new_business = false;
          scrapedBusiness.business_ref = scrapedBusiness.yahoo_uid
          scrapedBusiness.business_name = scrapedBusiness.name
          scrapedBusiness.name = matchedBrand.name
          scrapedBusiness.hasBusiness_ref = true
          var esg = scrapedBusiness.yahoo_esg
          console.log('this business already exists in DB, esg score: ' + JSON.stringify(esg))
            if ((!esg) || (esg.length < 1)) {
              scrapedBusiness.hasEsg = false
              console.log(JSON.stringify(esg))
            } else {
              scrapedBusiness.hasEsg = true
            }
          })
        }
      }
    } catch(error) {
      console.log(error);
    }
    console.log('scraped business' + JSON.stringify(scrapedBusiness))
    return scrapedBusiness
  }

  //functions to record in firestore if new brand/business
  function saveBrandData(matchedBusiness)  {
    if (matchedBusiness.new_brand == true) {
      console.log('brand to be recorded: ' + JSON.stringify(matchedBusiness));
      saveBrand(matchedBusiness);
    } else {
      console.log('no new brand to be recorded');
    }    
    return matchedBusiness
  }

  function saveBusinessData(scrapedBusiness) {  
    if (scrapedBusiness.new_business == false) {
      console.log('no business data to record for: ' +JSON.stringify(scrapedBusiness));  
    } else {
      console.log('business to be recorded: ' +JSON.stringify(scrapedBusiness));
      saveBusiness(scrapedBusiness)
    }
    return scrapedBusiness
  }

  module.exports = {checkBusinessData};