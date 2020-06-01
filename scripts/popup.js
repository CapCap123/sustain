import regeneratorRuntime from 'regenerator-runtime/runtime';
import {checkBusinessData} from './checkdata.js';

document.addEventListener('DOMContentLoaded', function() {

  chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
    var currentURL = tabs[0].url;
    var urlArray = currentURL.split('/');
    var name = urlArray[2];
    let website = await findWebsiteName(name);

    var websiteArray = await website.split(".")
    let websiteName = websiteArray[0];

    console.log(websiteName);
    let results = await checkBrand(websiteName);
    let answer = await sendAnswer(await results);
    console.log(JSON.stringify(answer))

    document.getElementById("postEsgResults").innerHTML = answer;

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


    var detailsButton = document.getElementById('details');
    detailsButton.addEventListener('click', function() {
      chrome.tabs.getSelected(null, function(tab) {      
        alert('thats not ready yet');
        console.log('button clicked');
      });
    }, false);
  }, false);