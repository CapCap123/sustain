import regeneratorRuntime from 'regenerator-runtime/runtime';

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);

  chrome.storage.sync.get(websiteName, function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    const results = result[websiteName];
    console.log("results are " + JSON.stringify(results));
    const answer = sendAnswer(results); 
    document.getElementById("postEsgResults").innerHTML = answer;

    if(results.hasBusiness_ref == true)  {
      const urlBusiness = "https://finance.yahoo.com/quote/";
      const yahooCode = results.yahoo_uid;
      const urlProfiledata = "/profile";
      const link = urlBusiness + yahooCode + urlProfiledata;

      const detailsButton = document.getElementById('detailsButton');
      detailsButton.addEventListener('click', function(tab) {
        window.open(link)
        console.log('clicked')
      });
    }
  })
});

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
    "This website belongs to "+ results.name + 
    "<br>" + results.name + " did not make their information public"
    );
    detailsButton.style.display = "block"
    return answer
  } else if (results.hasEsg == true) {
    let answer = (
    "This website belongs to " + results.name +
    ":<br>\u2022 ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
    ")<br>\u2022 Environmental risk: "+ results.yahoo_envrisk
    );
    detailsButton.style.display = "block"
    return answer
  }
}
}