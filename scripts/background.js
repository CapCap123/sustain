
import * as firebase from 'firebase/app'
import * as bootstrap from 'bootstrap'
import {firestore} from 'firebase/firestore'
import regeneratorRuntime from 'regenerator-runtime/runtime';
//import { ResultStorage } from 'firebase-functions/lib/providers/testLab';
//import { request } from 'express';

var config = {
  apiKey: '',
  authDomain: 'sustainability-4ae3a.firebaseapp.com',
  projectId: 'sustainability-4ae3a'
  };
firebase.initializeApp(config);
let db = firebase.firestore();
console.log('firebase initialized')

chrome.storage.sync.getBytesInUse (null, function (result) {
  console.log('bytes in use in sync: ' + result);
  if (result < 0.8 * 102400) {
    console.log('there is room in sync storage');
  } else { 
    chrome.storage.sync.clear(function() {
      console.log('sync storage cleared');
    });
  }
});

chrome.storage.local.getBytesInUse (null, function (result) {
  console.log('bytes in use in local: ' + result);
  if (result < 0.8 * 5242880) {
    console.log('there is room in local storage');
  } else { 
    chrome.storage.local.clear(function() {
      console.log('local storage cleared');
    });
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) { 
  if (changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined) {
    console.log('event on activated fired')
    chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
      var currentTab = tabs[0]
      var currentURL = currentTab.url;
      const websiteName = findWebsiteName(currentURL);

      chrome.storage.sync.get(websiteName, async function(result) {
        var results = result[websiteName];
        if(typeof results == 'undefined') {
          results = await checkBrandName(websiteName);
          console.log('bg results brand check: ' + results);
          chrome.storage.sync.set({[websiteName]: results}, function() {
            console.log("Value of " + websiteName + " is set to " + results);
          });
          let badgeColor = setBadge(await results);
          chrome.browserAction.setBadgeText({text: "   "});
          chrome.browserAction.setBadgeBackgroundColor({color: await badgeColor, tabId: currentTab.id});
        
        } else {
          console.log("website already in chrome storage");
          chrome.browserAction.setBadgeText({text: "   "});
          let badgeColor = setBadge(await results);
          chrome.browserAction.setBadgeBackgroundColor({color: await badgeColor, tabId: currentTab.id});
        }
      });
    })
  }
});

function findWebsiteName(currentURL) {
  var urlArray = currentURL.split('/');
  let name = urlArray[2];
  var website = name;
  if (name.includes("www.") == true) {
    website = name.replace("www.","");
  }
  var websiteFullArray = website.split(".")
  console.log('website full array: ' + websiteFullArray)
  var websiteArray = [websiteFullArray[0], websiteFullArray[1]]
  console.log('website array: ' + websiteArray)
  const websiteName = websiteArray.join('.');
  console.log('website name: ' + websiteName)

  
return websiteName;
}

function setBadge(results) {
  let colors = {
    "red": '#cc0000',
    "yellow":'#ecd23e',
    "green": '#3a9337',
    "grey": '#8a8c92'};

  if (results.hasBusiness_ref == true) {
    if (results.hasEsg == false) {
      let badgeColor = colors.red;
      return badgeColor
    } else {
      if (results.yahoo_percentile > 50) {
        let badgeColor = colors.yellow;
        return badgeColor
      } else {
        let badgeColor = colors.green;
        return badgeColor
      }
    }
  } else {
    let badgeColor = colors.grey;      
    return badgeColor  
  }

}

async function checkBrandName(websiteName){
  try {
  var brand = {};
  brand.name = websiteName;
  brand.website = websiteName;

  let results = await checkBusinessData(brand);

  return results

  } catch(error) {
    console.log(error);
  }
};

async function checkBusinessData(brand) {
  try {   
    var matchedBrand = await checkBrand(brand);
    var scrapedBusiness = await matchedBrand;
    var yahooCode = await matchedBrand.business_ref;
    console.log('yahoo code is ' + yahooCode)
    if (!yahooCode || yahooCode.length < 1) {
      console.log('no business ref found for this brand')
      scrapedBusiness.new_business = false
      scrapedBusiness.hasBusiness_ref = false
      scrapedBusiness.hasEsg = false
    } else {
      matchedBrand.hasBusiness_ref = true
      let businessQuery = db.collection('businesses').where('yahoo_uid', '==',  yahooCode)
      let businessSnapshot = await businessQuery.get()          
      if (businessSnapshot.empty) {
        console.log('scraper for business needed')
      } else { 
        businessSnapshot.forEach(doc => {
          scrapedBusiness = doc.data();
          scrapedBusiness.new_business = false;
          scrapedBusiness.business_ref = scrapedBusiness.yahoo_uid;
          scrapedBusiness.business_name = scrapedBusiness.name;
          scrapedBusiness.name = matchedBrand.name;
          scrapedBusiness.hasBusiness_ref = true;
          var esg = scrapedBusiness.yahoo_esg;
            if ((!esg) || (esg.length < 1)) {
              scrapedBusiness.hasEsg = false
            } else {
              scrapedBusiness.hasEsg = true
            }
        })
      }
    }
  } catch(error) {
    console.log(error);
  }

  return scrapedBusiness
}

async function checkBrand(brand) {
  try {
  let websiteName = brand.website;
    let brandQuery = db.collection('brands').where('websites', 'array-contains',  websiteName);
    let querySnapshot = await brandQuery.get();
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

return brand;
}