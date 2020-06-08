function authenticatedXhr(method, url, callback) {
    var retry = true;
    function getTokenAndXhr() {
      chrome.identity.getAuthToken({interactive: true}, function (access_token) {
        if (chrome.runtime.lastError) { callback(chrome.runtime.lastError);
          return;
        }
  
        var xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.setRequestHeader('Authorization','Bearer ' + access_token);
  
        xhr.onload = function () {
          if (this.status === 401 && retry) {
            retry = false;
            chrome.identity.removeCachedAuthToken({ 'token': access_token }, getTokenAndXhr);
            return;
          }
  
          callback(null, this.status, this.responseText);
        }
      });
    }
  }

  async function login() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
    if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        var status = "failed";
        console.log(status);
        return status;
    }
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
    x.onload = function() {
        alert(x.response);
        status = "success";
        console.log(status);
    };
    x.send();
    return status;
  });
  return true
  }

//const loggedIn = login();

if(demandsResults[0]) {
    console.log("ordered results are" + JSON.stringify(demandsResults));
    const displayedQuestion1 = await demandsResults[0];
      demandPanel.style.display = "block";
      demandResult.innerHTML = displayedQuestion1.question;
      requestButton1.innerHTML = "Request";

    const keys = 'demands';

     chrome.storage.sync.get(keys, async function(res) {
      console.log("get demands from storage: " + res[keys]);
      let resultsDemand = res[keys];
      console.log("results about requests retrieved from storage are: " + JSON.stringify(resultsDemand));
      //const displayDemands = displayDemand(resultsDemand, keys, displayedQuestion1);

if(!resultsDemand) {
console.log('results are empty')

requestButton1.addEventListener('click', async function(tab) {

    requestButton1.innerHTML = "requested";
    requestButton1.style.display = "disabled";
    requestButton1.style.backgroundColor = colors.requested;

    chrome.storage.sync.set({[keys]: await displayedQuestion1}, async function(res) {
    console.log("Value of storage displayquestion1 " + JSON.stringify(displayedQuestion1));
    });
});
} else {
console.log('results are NOT empty')
requestButton1.innerHTML = "requested";
requestButton1.style.display = "disabled";
requestButton1.style.backgroundColor = colors.requested;
}
})
} else {
console.log('demand will not be displayed');
demandPanel.style.display = "none";
}