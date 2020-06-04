import regeneratorRuntime from 'regenerator-runtime/runtime';

  chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
    var currentTab = tabs[0]
    var currentURL = currentTab.url;
    var urlArray = currentURL.split('/');
    let name = urlArray[2];
    let website = findWebsiteName(name);

    var websiteArray = website.split(".")
    let websiteName = websiteArray[0];

    chrome.storage.sync.get(websiteName, function(result) {
      console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
      let answer = sendAnswer(result[websiteName]); 
      document.getElementById("postEsgResults").innerHTML = answer;
    })
  });

  function findWebsiteName(name) {
    const www = "www."
    var website = name;
    if (name.includes(www) == true) {
      website = name.replace(www,"");
      } else {
      website = name 
      }
  return website;
  }

function sendAnswer(results) {  
  if(results.hasBusiness_ref == false) {
    let answer =  (
      "We did not find official information about "+ results.name
      ); 
      detailsButton.style.display = "none"
      return answer
  } else {
    if (results.hasEsg == false) {
      let answer = (
      "This website belongs to "+ results.business_name + 
      "<br>" + results.business_name + " did not make their information public"
      );
      detailsButton.style.display = "block"
      return answer
    } else if (results.hasEsg == true) {
      let answer = (
      "This website belongs to " + results.business_name +
      ":<br>\u2022 ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
      ")<br>\u2022 Environmental risk: "+ results.yahoo_envrisk
      );
      detailsButton.style.display = "block"
      return answer
    }
  }
}

  var detailsButton = document.getElementById('details');
  detailsButton.addEventListener('click', function() {
    chrome.tabs.getSelected(null, function(tab) {      
      alert('thats not ready yet');
      });
    }, false);