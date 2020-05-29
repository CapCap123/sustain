document.addEventListener('DOMContentLoaded', function() {

  chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {
    var currentURL = tabs[0].url;
    var urlArray = currentURL.split('/');
    var name = urlArray[2];

    const www = "www."
    if (name.includes(www) == true) {
      websiteName = name.replace(www,"")
    } else {
    websiteName = name }
    console.log(websiteName);
    //results = await checkBrand(websiteName);

    /*
    async function checkBrand(websiteName){
      try {
      var brand = {};
    
      brandname = websiteName
      console.log('check brandname: ' + brandname);
      brand.name = brandname;
      brand.website = websiteName;
    
      results = await checkBusinessData(brand)
    
      return(results)
    
      } catch(error) {
        console.log(error)
      }
    };
    */
  });


    var detailsButton = document.getElementById('details');
    detailsButton.addEventListener('click', function() {
      chrome.tabs.getSelected(null, function(tab) {      
        alert('thats not ready yet');
        console.log('button clicked');
      });
    }, false);
  }, false);