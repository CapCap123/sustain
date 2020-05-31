import regeneratorRuntime from 'regenerator-runtime/runtime';
import {checkBusinessData} from './checkdata.js';

document.addEventListener('DOMContentLoaded', function() {

  chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
    var currentURL = tabs[0].url;
    var urlArray = currentURL.split('/');
    var name = urlArray[2];
    let website = await findWebsiteName(name);

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
    

    var websiteArray = await website.split(".")
    let websiteName = websiteArray[0];

    console.log(websiteName);
    let results = await checkBrand(websiteName);

    async function checkBrand(websiteName){
      try {
      var brand = {};
    
      let brandname = websiteName
      console.log('check brandname: ' + brandname);
      brand.name = brandname;
      brand.website = websiteName;
    
      results = await checkBusinessData(brand)
    
      return(results)
    
      } catch(error) {
        console.log(error)
      }
    };
  });


    var detailsButton = document.getElementById('details');
    detailsButton.addEventListener('click', function() {
      chrome.tabs.getSelected(null, function(tab) {      
        alert('thats not ready yet');
        console.log('button clicked');
      });
    }, false);
  }, false);