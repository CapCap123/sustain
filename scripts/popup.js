import regeneratorRuntime from 'regenerator-runtime/runtime';
import {db} from './background.js';
import {auth} from 'firebase/auth';

//import { getUserID } from './background.js';
import * as firebase from 'firebase/app'

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
  let user = firebase.auth().currentUser; 

  const detailsButton = document.getElementById('detailsButton');
  const demandPanel = document.getElementById('demands');
  const demandResult = document.getElementById('postDemandResults')
  demandPanel.style.display = "none";
  demandResult.style.display = "none";
 
  const requestButton1 = document.getElementById("requestButton1");

  // identify website
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);
  
  chrome.storage.sync.get(websiteName, async function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    let results = await result[websiteName];
    console.log('website name is: ' + JSON.stringify(websiteName));
    console.log("results are " + JSON.stringify(results));

    // display esg
    let answer = await displayEsg(results);
    document.getElementById("postEsgResults").innerHTML = answer;
    demandResult.style.display = "block";

    //display question

    firebase.auth().onAuthStateChanged(async function(user) {
      if (user) {
        user.providerData.forEach(async function (profile) {
          let fullid = profile.uid;
          alert (fullid);
          const demandsResults = await publishContent(results,fullid);
          alert('demands resulrs in core' + JSON.stringify(demandsResults));

          if(demandsResults[0]) {
            console.log("ordered results are" + JSON.stringify(demandsResults));
            const displayedQuestion1 = demandsResults[0];
            demandPanel.style.display = "block";
            demandResult.innerHTML = displayedQuestion1.question;
            requestButton1.innerHTML = "Request";
          
            requestButton1.addEventListener('click', async function(tab) {
              requestButton1.innerHTML = "requested";
              requestButton1.style.display = "disabled";
              requestButton1.style.backgroundColor = colors.requested;
            });
          } else {
            console.log('demand will not be displayed');
            demandPanel.style.display = "none";
          }
        })
      } else {
    }
    })
  });
})

// demand functions
async function publishContent(results,fullid){
  try{
    const brandDocId = results.docId;
    var demands = await checkQueries(brandDocId,fullid);
    const nb = demands.length;
    var demandsResults = [];
    console.log('demands in publish' + JSON.stringify(demands));

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

async function checkQueries(brandDocId, fullid) {
  try {
    var demands2 = [];
    let demands = await checkDemands(brandDocId);
    console.log('demands in check queries' + JSON.stringify(demands));
    for (let i = 0; i < demands.length; i ++) {
      let demand2 = demands[i];
      let question = demand2.questionId;
      let userQuery = db.collection('brands').doc(brandDocId).collection('questions').doc(question).collection('demands');
      let demandSnapshot = await userQuery.get();
      if (!demandSnapshot.empty) {
        demandSnapshot.forEach(doc => {
          if (doc.id == fullid) {
          demand2.requested = doc.data().upvote;
          demands2.push(demand2);
          } else {}
        })
      } else {
        demands2.push(demand2);
      }
    }
  return demands2
  } catch(error) {
    console.log(error);
  }
}

async function checkDemands(brandDocId){
  try{
    var demands = [];
    let demandQuery = db.collection('brands').doc(brandDocId).collection('questions')
    let querySnapshot = await demandQuery.get();
    if (!querySnapshot.empty) {
      console.log('query in checkdemands is not empty');
      querySnapshot.forEach(doc => { //if brand exists
        const demand = {"name": doc.data().name , "question": doc.data().question, "upvote": doc.data().upvote, "downvote": doc.data().downvote, "questionId": doc.id};
        demands.push(demand);
      })
    } else {
      console.log('query in checkdemands is empty');
    }
    console.log('demands in check demands' + JSON.stringify(demands));
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

// functions others
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