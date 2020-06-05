import regeneratorRuntime from 'regenerator-runtime/runtime';

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);

  chrome.storage.sync.get(websiteName, function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    let results = result[websiteName];
    console.log("results are " + JSON.stringify(results));
    let answer = sendAnswer(results); 
    document.getElementById("postEsgResults").innerHTML = answer;

    if(results.hasBusiness_ref == true)  {
      console.log('link should be clickable')
      const urlBusiness = "https://finance.yahoo.com/quote/";
      let yahooCode = results.yahoo_uid;
      const urlProfiledata = "/profile";
      let link = urlBusiness + yahooCode + urlProfiledata;
      console.log(link);

      var detailsButton = document.getElementById('detailsButton');
      detailsButton.addEventListener('click', function(link) {
        chrome.tabs.create({ url: JSON.stringify(link), active: false }, function (tab){
          console.log('clicked')
        })
      });
    }
  })
});

function findWebsiteName(currentURL) {
  var urlArray = currentURL.split('/');
  let name = urlArray[2];
  var website = name;
  if (name.includes("www.") == true) {
    website = name.replace("www.","");
  }
  var websiteFullArray = website.split(".")
  var websiteArray = [websiteFullArray[0], websiteFullArray[1]]
  const websiteName = websiteArray.join('.');
  
return websiteName;
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