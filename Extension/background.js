import regeneratorRuntime from 'regenerator-runtime/runtime';
import { UserDimensions } from 'firebase-functions/lib/providers/analytics';
import {findWebsiteName} from './general.js';
import {checkBusinessData} from './firebase.js';
import { ResultStorage } from 'firebase-functions/lib/providers/testLab';

let toReview = {
}

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
    if (currentTab != null ) {
      chrome.browserAction.disable(currentTab.id);
      chrome.browserAction.setBadgeText({text: ""});
    }
  })
  chrome.tabs.query({active: true, currentWindow: true, status: "complete"}, async function(tabs) {
    const currentTab = tabs[0];
    if(currentTab) {
      chrome.browserAction.setBadgeText({text: ""});
      chrome.browserAction.disable(currentTab.id);

      const currentURL = currentTab.url;
      const websiteName = await findWebsiteName(currentURL);

      chrome.storage.sync.get(websiteName, async function(result) {
        let results = await result[websiteName];
        chrome.browserAction.enable(currentTab.id);
        if(results && (results.small_business != "new" || !toReview[results.business_name])) {
          console.log('getting business from storage');
          let badgeColor = setBadge(await results);
          chrome.browserAction.setBadgeText({text: "   "});
          chrome.browserAction.setBadgeBackgroundColor({color: badgeColor, tabId: currentTab.id});
        } else {
          console.log('getting business from DB');
          let brand = {name: websiteName, website: websiteName};
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