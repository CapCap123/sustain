import regeneratorRuntime from 'regenerator-runtime/runtime';
import {db} from './background.js';
import * as firebase from 'firebase/app'
import {auth} from 'firebase/auth'

const colors = {
  "requested": "#afafaf"
};

const trophies ={
  "circular": "Circular economy",
  "local": "Local products",
  "packaging": "Eco-friendly packaging",
  "supply-chain": "Transparent supply chain",
  "vegan": "great vegan options"
};

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
  const detailsButton = document.getElementById('detailsButton');

  const demandPanel = document.getElementById('demands');
  demandPanel.style.display = "none";
  const demandResult = document.getElementById('postDemandResults')
  demandResult.style.display = "none";
 
  const requestButton1 = document.getElementById("requestButton1");

  // identify website
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);
  
  chrome.storage.sync.get([websiteName], async function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    let results = result[websiteName];
    console.log('website name is: ' + JSON.stringify(websiteName));
    console.log("results are " + JSON.stringify(results));

    // display esg
    if (results) {
      let answer = displayEsg(results);
      document.getElementById("postEsgResults").innerHTML = answer;
      demandResult.style.display = "block";

      //display question
      const demandsResults = await publishContent(results);
      if(demandsResults[0]) {
      console.log("ordered results are" + JSON.stringify(demandsResults));
      const displayedQuestion1 = demandsResults[0];
        demandPanel.style.display = "block";
        demandResult.innerHTML = displayedQuestion1.question;
        requestButton1.innerHTML = "Request";
      
        requestButton1.addEventListener('click', async function(tab) {
          const loggedIn = login();
          requestButton1.innerHTML = "requested";
          requestButton1.style.display = "disabled";
          requestButton1.style.backgroundColor = colors.requested;
        });
      } else {
        console.log('demand will not be displayed');
        demandPanel.style.display = "none";
      }
    } else {
        alert('oops, try relading the tab')
    }
  });
})

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

  var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
  firebase.auth().signInWithCredential(credential);
  return status;
});
return true
}

// demand functions
async function publishContent(results){
  try{
    console.log('results inside of publish content' + JSON.stringify(results));
    const brandDocId = results.docId;
    var demands = await checkDemands(brandDocId);
    console.log("results for demand are : " + JSON.stringify(demands) + " and brand doc id is: " + brandDocId);
    const nb = demands.length;
    var demandsResults = [];

    for (let i = 0; i < nb; i ++) {
      const question = await demands[i];
      console.log('questions is : ' + JSON.stringify(question));
      const popularity = question.upvote + question.downvote;
      question.popularity = popularity;
      demandsResults[i] = question;
    }

    const sortedResults = demandsResults.sort(function(a, b){
      return b.popularity-a.popularity
    });

  return sortedResults
  } catch(error) {
    console.log(error);
  }
};

async function checkDemands(brandDocId){
  try{
    var demands = [];
    let demandQuery = db.collection('brands').doc(brandDocId).collection('questions')
    let querySnapshot = await demandQuery.get();
    if (!querySnapshot.empty) {
      querySnapshot.forEach(doc => { //if brand exists
        const demand = {"name": doc.data().name , "question": doc.data().question, "upvote": doc.data().upvote, "downvote": doc.data().downvote, "questionId": doc.id};
        demands.push(demand);
      })
    }
  return demands
  } catch(error) {
    console.log(error);
  }
};

//functions esg
function displayEsg(results) {
  if(results.hasBusiness_ref == false) {
    let answer =   (
      "We did not find official information about "+ results.name
      ); 
      detailsButton.style.display = "none"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
  } else {
    if (results.hasEsg == false) {
      let answer = (
      "This website belongs to "+ results.name + 
      "<br>" + results.name + " did not make their information public"
      );
      detailsButton.style.display = "block"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    } else if (results.hasEsg == true) {
      let answer =  (
      "This website belongs to " + results.name +
      ":<br>\u2022 ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
      ")<br>\u2022 Environmental risk: "+ results.yahoo_envrisk
      );
      displayLink(results.yahoo_uid)
      detailsButton.style.display = "block"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    }
  }
}

function displayLink(yahooCode) {
  const urlBusiness = "https://finance.yahoo.com/quote/";
  const urlProfiledata = "/profile";
  const link = urlBusiness + yahooCode + urlProfiledata;
  
  detailsButton.addEventListener('click', function(tab) {
    window.open(link)
    console.log('clicked')
  });
  }

// functions url
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