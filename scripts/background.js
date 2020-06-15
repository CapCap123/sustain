import * as firebase from 'firebase/app'
import {firestore} from 'firebase/firestore'
import regeneratorRuntime from 'regenerator-runtime/runtime';
import {auth} from 'firebase/auth'
import { UserDimensions } from 'firebase-functions/lib/providers/analytics';
import {findWebsiteName} from './general.js';

var config = {
  apiKey: "AIzaSyBrJTjQo6gZ6UX_iTo8z1muvrIoMxkXvwo",
  authDomain: "sustainability-4ae3a.firebaseapp.com",
  databaseURL: "https://sustainability-4ae3a.firebaseio.com",
  projectId: "sustainability-4ae3a",
  storageBucket: "sustainability-4ae3a.appspot.com",
  messagingSenderId: "915190118676",
  appId: "1:915190118676:web:7047070d6042c1d685aa01",
  measurementId: "G-0NH1RKVV78"
  };

firebase.initializeApp(config);
let db = firebase.firestore();
module.exports = { db };

chrome.tabs.onActivated.addListener(function (tabId, windowId) { 
  console.log('tab activated');
  let badgeUpdated = updateBadge();
  chrome.tabs.onUpdated.addListener(function(changeInfo ,tabs) {
        let badgeUpdated = updateBadge();
  });
});

async function updateBadge() {
  chrome.tabs.query({active: true, currentWindow: true}, async function(tabs) {
    const currentTab = tabs[0];
    chrome.browserAction.disable(currentTab.id);
    chrome.browserAction.setBadgeText({text: ""});
  })
  chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, async function(tabs) {
    const currentTab = tabs[0];
    chrome.browserAction.setBadgeText({text: ""});
    chrome.browserAction.disable(currentTab.id);
    console.log(JSON.stringify(currentTab));
    if(currentTab) {
      const currentURL = currentTab.url;
      const websiteName = await findWebsiteName(currentURL);

      chrome.storage.sync.get(websiteName, async function(result) {
        let results = await result[websiteName];
        chrome.browserAction.enable(currentTab.id);
        if(results && (results.small_business != "new")) {
          console.log('bg, new_brand = new: ' + JSON.stringify(results));

          let badgeColor = setBadge(await results);
          chrome.browserAction.setBadgeText({text: "   "});
          chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: currentTab.id});
        } else {
          var brand = await checkBrandName(websiteName);
          const results = await checkBusinessData(brand);
          console.log('bg from DB: ' + JSON.stringify(results));

          let badgeColor = setBadge(await results);
          chrome.browserAction.setBadgeText({text: "   "});
          chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: currentTab.id});

          chrome.storage.sync.set({[websiteName]: results}, function() {
            console.log("Value in BG of " + websiteName + " is set to " + JSON.stringify(results));
          });
        }
      return true
      })
    }
  })
}

// function website name
async function checkBrandName(websiteName){
  try {
  var brand = {};
  brand.name = websiteName;
  brand.website = websiteName;
  return brand

  } catch(error) {
    console.log(error);
  }
};

// firebase data
async function checkBusinessData(brand) {
  try {   
    const matchedBusiness = await checkBrand(brand);
    const yahooCode = matchedBusiness.business_ref;
    console.log('yahoo code is ' + yahooCode)

    if (!yahooCode || yahooCode.length < 1) {
      console.log('no business ref found for this brand')
      var finalBusiness = matchedBusiness;
      finalBusiness.hasBusiness_ref = false;
      finalBusiness.hasEsg = false;
    } else {
      let businessQuery = db.collection('businesses').where('yahoo_uid', '==',  yahooCode);
      let businessSnapshot = await businessQuery.get();        
      if (businessSnapshot.empty) {
        console.log('scraper for business needed');
        var finalBusiness = matchedBusiness;
        finalBusiness.hasBusiness_ref = false;
        finalBusiness.hasEsg = false;
      } else { 
        businessSnapshot.forEach(doc => {
          finalBusiness = doc.data();
          finalBusiness.new_business = false;
          finalBusiness.hasBusiness_ref = true;
          finalBusiness.business_ref = matchedBusiness.yahoo_uid;
          finalBusiness.brand_name = matchedBusiness.name;
          finalBusiness.docId = matchedBusiness.docId;
          finalBusiness.new_brand =  matchedBusiness.new_brand;
          finalBusiness.local = matchedBusiness.local;
          finalBusiness.business_name = matchedBusiness.business_name;
          finalBusiness.small_business = matchedBusiness.small_business;
          const esg = finalBusiness.yahoo_esg;
            if ((!esg) || (esg.length < 1)) {
              finalBusiness.hasEsg = false;
            } else {
              finalBusiness.hasEsg = true;
            }
        })
      }
    }
  } catch(error) {
    console.log(error);
  }
  console.log('finalBusiness is : ' + JSON.stringify(finalBusiness));
  return finalBusiness
}

async function checkBrand(brand) {
  try {
    const websiteName = brand.website;
    console.log('brand: ' + brand+' websiteName: ' + websiteName);
    let brandQuery = db.collection('brands').where('websites', 'array-contains',  websiteName);
    let querySnapshot = await brandQuery.get();
    if (querySnapshot.empty) {
      console.log('brand does not exist in db');
      brand.new_brand = true;        
    } else {
      console.log('brand exists in db');  
      querySnapshot.forEach(doc => { //if brand exists
        const businessRef = doc.data().business_ref;
        brand.business_name = doc.data().business_name;
        brand.small_business = doc.data().small_business;
        brand.docId = doc.id;
        brand.private = doc.data().private;
        brand.new_brand = doc.data().small_business; 
        brand.local = doc.data().local; 
        brand.brand_name = doc.data().name
        console.log('brand extracted is: ' + JSON.stringify(brand));
        if((!businessRef) || businessRef.empty) {
          console.log('this brand has no business ref');
          brand.hasEsg = false;
          brand.business_ref = "";      
        } else{
          brand.business_ref = businessRef;
          brand.hasBusiness_ref = true;
          console.log('brand exists and has business ref')
        }
      })
    }
  } catch(error) {
    console.log(error)
  }
console.log('brand is : ' + JSON.stringify(brand));
return brand;
}

// display
function setBadge(results) {
  const colors = {
    "red": '#cc0000',
    "yellow":'#ecd23e',
    "green": '#3a9337',
    "grey": '#8a8c92'};

  if (results.hasBusiness_ref == true) {
    if (results.hasEsg == false) {
      let badgeColor = colors.red;
      return badgeColor
    } else if (results.yahoo_controverse && results.yahoo_controverse > 3) {
      let badgeColor = colors.red;
      return badgeColor;
    } else {
      if (results.yahoo_esg < 30) {
        let badgeColor = colors.green;
        return badgeColor
      } else if (results.yahoo_esg <60) {
        let badgeColor = colors.yellow;
        return badgeColor
      } else {
        let badgeColor = colors.red;
        return badgeColor
      }
    }
  } else {
    let badgeColor = colors.grey;      
    return badgeColor  
  }
}

// chrome storage
chrome.storage.sync.getBytesInUse (null, function (result) {
  console.log('bytes in use in sync: ' + result);
  if (result < 0.000000008 * 102400) {
    console.log('there is room in sync storage');
  } else { 
    chrome.storage.sync.clear(function() {
      console.log('sync storage cleared');
    });
  }
});

chrome.storage.local.getBytesInUse (null, function (result) {
  console.log('bytes in use in local: ' + result);
  if (result < 0.00000008 * 5242880) {
    console.log('there is room in local storage');
  } else { 
    chrome.storage.local.clear(function() {
      console.log('local storage cleared');
    });
  }
});