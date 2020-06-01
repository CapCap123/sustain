import regeneratorRuntime from 'regenerator-runtime/runtime';
import {checkBusinessData} from './checkdata.js';
import { ResultStorage } from 'firebase-functions/lib/providers/testLab';

//document.addEventListener('DOMContentLoaded', function() {
  //chrome.webNavigation.onCompleted.addListener(function(details) {
    //chrome.tabs.executeScript({active: true, currentWindow: true} , async function (tabs) {


    // window.onload=function(tabs) {
 //chrome.tabs.onUpdated.addListener({currentWindow: true}, async function (tabs)  {
    //console.log("page load!");
   //}
  chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
  //chrome.tabs.onUpdated.addListener(async function (tabs) {

    var currentTab = tabs[0]
    console.log('current tab: ' + JSON.stringify(currentTab));
    var currentURL = currentTab.url;
    var urlArray = currentURL.split('/');
    var name = urlArray[2];
    let website = await findWebsiteName(name);

    var websiteArray = await website.split(".")
    let websiteName = websiteArray[0];

    console.log(websiteName);
    let results = await checkBrand(websiteName);
    let answer = await sendAnswer(await results);
    let badgeColor = await setBadge(await results);
    console.log(badgeColor)
    chrome.browserAction.setBadgeText({text: "   "});
    chrome.browserAction.setBadgeBackgroundColor({color: await badgeColor, tabId: currentTab.id});

    console.log(JSON.stringify(answer))
    document.getElementById("postEsgResults").innerHTML = answer;

    function setBadge(results) {
      let colors = {
        "red": '#cc0000',
        "yellow":'#ecd23e',
        "green": '#3a9337',
        "grey": '#8a8c92'
      }
      if (results.hasBusiness_ref == true) {
        if (results.hasEsg == false) {
        var badgeColor = colors.red
        } else {
          if (results.yahoo_percentile > 50) {
            var badgeColor = colors.orange
          } else {
            var badgeColor = colors.green
          }
        }
      console.log('color badge changed')
      } else {
        var badgeColor = colors.grey
      }
      return badgeColor
    }

    async function findWebsiteName(name) {
      try {
        const www = "www."
        if (name.includes(www) == true) {
          website = name.replace(www,"");
          } else {
          website = name 
          }
      } catch(error) {
        console.log(error);
      }
      return website;
    }

    async function checkBrand(websiteName){
      try {
      let brand = {};
    
      let brandname = websiteName
      console.log('check brandname: ' + brandname);
      brand.name = brandname;
      brand.website = websiteName;
    
      let results = await checkBusinessData(brand)
    
      console.log('results: ' + JSON.stringify(results))
    
      return results
    
      } catch(error) {
        console.log(error);
      }
    };

    async function sendAnswer(results) {  
      try {
      if(results.hasBusiness_ref == false) {
        answer =  (
          "We did not find official information about "+ results.name
          ) 
      } else {
        if (results.hasEsg == false) {
          answer = (
          "This website belongs to "+ results.business_name + 
          "<p>" + results.business_name + " did not make their information public"
          )
        } else {
          answer = (
          "This website belongs to " + results.business_name +
          ":<p>- ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
          ")<p>- Environmental risk: "+ results.yahoo_envrisk
          )
        }
      }
    } catch(error) {
      console.log(error)
    }
    return answer
    }
  });
/*});


  var detailsButton = document.getElementById('details');
  detailsButton.addEventListener('click', function() {
    chrome.tabs.getSelected(null, function(tab) {      
      alert('thats not ready yet');
      });
    }, false);
  }, false);*/