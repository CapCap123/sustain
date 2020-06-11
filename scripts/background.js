
import * as firebase from 'firebase/app'
import * as bootstrap from 'bootstrap'
import {firestore} from 'firebase/firestore'
import regeneratorRuntime from 'regenerator-runtime/runtime';
import {auth} from 'firebase/auth'
import { UserDimensions } from 'firebase-functions/lib/providers/analytics';

var config = {
  apiKey: '',
  authDomain: 'sustainability-4ae3a.firebaseapp.com',
  projectId: 'sustainability-4ae3a'
  };
firebase.initializeApp(config);
let db = firebase.firestore();
module.exports = { db };

//let authUser = firebase.auth();
//module.exports = {authUser};


chrome.tabs.onActivated.addListener(function (tabId, windowId) { 
  //alert('tab activated');
  let badgeUpdated = updateBadge();
  chrome.tabs.onUpdated.addListener(function(changeInfo ,tabs) {
        //alert(changeInfo);
        let badgeUpdated = updateBadge();
  });

});

async function updateBadge() {
  chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, async function(tabs) {
    const currentTab = tabs[0];
    if(currentTab) {
    //alert(JSON.stringify(currentTab));
    const currentURL = currentTab.url;
    const websiteName = findWebsiteName(currentURL);

    chrome.storage.sync.get(websiteName, async function(result) {
      //alert( websiteName + " results retrieved from storage in BG is " + result[websiteName]);
      let results = await result[websiteName];
      if(results && (results.new_brand != "new")) {
        console.log(results);

        let badgeColor = setBadge(await results);
        chrome.browserAction.setBadgeText({text: "   "});
        chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: currentTab.id});
      } else {
        //alert('results not yet in storage');
        var brand = await checkBrandName(websiteName);
        const results = await checkBusinessData(brand);

        let badgeColor = setBadge(await results);
        chrome.browserAction.setBadgeText({text: "   "});
        chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: currentTab.id});

        chrome.storage.sync.set({[websiteName]: results}, function() {
          //alert("Value in BG of " + websiteName + " is set to " + results);
        });
      }
    return true
  })
}
})
}

// function website name
function findWebsiteName(currentURL) {
  const urlArray = currentURL.split('/');
  const name = urlArray[2];

  var website = name;
  if (name.includes("www.") == true) {
    website = name.replace("www.","");
  }

  const websiteFullArray = website.split(".")
  const websiteArray = [websiteFullArray[0], websiteFullArray[1]]
  const websiteName = websiteArray.join('.');
  
return websiteName;
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
      finalBusiness.new_business = false;
      finalBusiness.hasBusiness_ref = false;
      finalBusiness.hasEsg = false;
    } else {
      let businessQuery = db.collection('businesses').where('yahoo_uid', '==',  yahooCode);
      let businessSnapshot = await businessQuery.get();        
      if (businessSnapshot.empty) {
        console.log('scraper for business needed');
        var finalBusiness = matchedBusiness;
        finalBusiness.new_business = false;
        finalBusiness.hasBusiness_ref = false;
        finalBusiness.hasEsg = false;
        finalBusiness.name = matchedBusiness.business_name;
        finalBusiness.brand_name = matchedBusiness.name  
      } else { 
        businessSnapshot.forEach(doc => {
          finalBusiness = doc.data();
          finalBusiness.new_business = false;
          finalBusiness.business_ref = matchedBusiness.yahoo_uid;
          finalBusiness.brand_name = matchedBusiness.name;
          finalBusiness.docId = matchedBusiness.docId;
          finalBusiness.hasBusiness_ref = true;
          finalBusiness.new_brand =  matchedBusiness.new_brand
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
      brand.new_brand = false;     
      querySnapshot.forEach(doc => { //if brand exists
        const businessRef = doc.data().business_ref
        const businessName = doc.data().business_name
        const brandDocId = doc.id;
        brand.small_business = doc.data().small_business
        brand.docId = brandDocId;
        console.log('brand extracted is: ' + JSON.stringify(brand));
        if((!businessRef) || businessRef.empty) {
          console.log('this brand has no business ref')
          brand.hasEsg = false;
          brand.business_ref = "";      
        } else{
          brand.business_ref = businessRef;
          brand.business_name = businessName;
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

// chrome storage
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