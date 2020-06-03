//import {checkBusinessData} from './checkdata.js';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    let currentTab = request.tab;
    var currentURL = currentTab.url;
    var urlArray = currentURL.split('/');
    var name = urlArray[2];
    let website = findWebsiteName(name);
    var websiteArray = website.split(".")
    let websiteName = websiteArray[0];
    //sendResponse("OK");
    //const results = checkBrand(websiteName)
    //sendResponse(websiteName);

  (websiteName,name) => {
      let results = getAnswer(websiteName,name);
      return results;
    };

    sendResponse("OK");

/*
    function(websiteName) => {
      console.log("async function on:")
      const results = await checkBrand(websiteName);
      chrome.browserAction.setBadgeText({text: "oo"});
      return results

    results = (async function(websiteName) => {
        console.log("async function on:")
        const results = await checkBrand(websiteName);
        chrome.browserAction.setBadgeText({text: "oo"});
        return results
      });
      */

  return true;     
   // sendResponse(websiteName)
});

function getAnswer(websiteName,name) {
  var brand = {};
  brand.website = websiteName;
  brand.name = name;

  let answer = brand;
  return answer;
};
  

function findWebsiteName(name) {
    const www = "www."
    if (name.includes(www) == true) {
      website = name.replace(www,"");
      } else {
      website = name 
      }
  return website;
}

function runIt(text) {
    alert(text);
}

/*
chrome.runtime.onMessage.addListener( function (request, sender) {
   // alert("message received");
    //console.log("message received");
    //if (message.greetings === "hello") {
        let currentTab = message.tab;
        let tabId = currentTab.id;
        runIt(tabId);

        var currentURL = currentTab.url;
        var urlArray = currentURL.split('/');
        var name = urlArray[2];
        let website = findWebsiteName(name);
        var websiteArray = website.split(".")
        let websiteName = websiteArray[0];



        function runIt(websiteName) {
            alert(websiteName);
        }
        

        function findWebsiteName(name) {
            const www = "www."
            if (name.includes(www) == true) {
              website = name.replace(www,"");
              } else {
              website = name 
              }
          return website;
        }
        //sendResponse("OK");
      /*(async (websiteName) => {
        var results = await checkBrand(websiteName);
        console.log("async function on")
        //sendResponse({results});
      })();
    

      //return true; // keep the messaging channel open for sendResponse
   //}
   return websiteName
  });
*/
