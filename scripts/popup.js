import regeneratorRuntime from 'regenerator-runtime/runtime';
import {db} from './background.js';
import {auth} from 'firebase/auth';
import $ from 'jquery';


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
  demandPanel.style.display = "none";
  const trophiesPanel = document.getElementById('trophies');
  trophiesPanel.style.display = "none";

  // identify website
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);
  
  chrome.storage.sync.get(websiteName, async function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    let results = await result[websiteName];
    if(results) {
      console.log('website name is: ' + JSON.stringify(websiteName));
      console.log("results are " + JSON.stringify(results));
        let brandDocId = results.docId;

      // display esg
      let answer = await displayEsg(results);
      document.getElementById("postEsgResults").innerHTML = answer;

      //display question
      firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
          user.providerData.forEach(async function (profile) {
            let fullid = profile.uid;
            displayDemand(results, websiteName, name, fullid, demandPanel);
            displayTrophies(results, websiteName, name, fullid, trophiesPanel);
          })
        } else {
          login()
        }
    })
  } else {
    alert ('oops, try again later');
  }
  });
})


// massive function display
async function displayDemand(results, websiteName, name, fullid, demandPanel) {
  const demandPanel1 = document.getElementById('demands1');
  const demandResult1 = document.getElementById('postDemandResults1');
  const requestButton1 = document.getElementById("requestButton1");
  const demandPanel2 = document.getElementById('demands2');
  const demandResult2 = document.getElementById('postDemandResults2')
  const requestButton2 = document.getElementById("requestButton2");
  const demandPanel3 = document.getElementById('demands3');
  const demandResult3 = document.getElementById('postDemandResults3');
  const requestButton3 = document.getElementById("requestButton3");

  const demandPanelDropdown = document.getElementById('demandsDropdown');
  const dropdownItems = document.querySelector('.dropdown-menu');
  const demandOption1 = document.getElementById('option1');
  //const demandOption2 = document.getElementById('option2');
  //const demandOption3 = document.getElementById('option3');
  var dropdownButtons = [demandOption1];
  const demandCreate =  document.getElementById('createDemand');

  const demandPanelInput = document.getElementById('demandsInput');
  const inputButton = document.getElementById('inputButton');
  const demandresultsCustom = document.getElementById('postDemandResultsCustom');
  const demandCustomRequest = $("input:text");

  const collection = 'questions';
  const demandsResults = await publishContent(results,fullid,collection);
  demandPanel.style.display = "block";
  demandPanel3.style.display = "none";

  inputButton.addEventListener('click', function(tab) {
    console.log('to do');
    let customDemand = demandCustomRequest.val();
    if (customDemand.length > 20 && customDemand.length < 50 ) {
      if (results.new_brand == true) {
        registerNewBrand(websiteName, name, customDemand, fullid)
      } else {
      registerNewDemand(brandDocId, customDemand ,fullid);
      }
    demandPanelInput.style.display = "none"
    demandPanel3.style.display = "block"
    demandResult3.innerHTML = customDemand;
    requestButton3.innerHTML = "Requested";
    requestButton3.disabled = true;
    requestButton3.style.backgroundColor = colors.requested;
    } else if (demandCreate.innerText.length > 20 ){
      alert('Your demand is not descriptive enough');
    } else if (demandCreate.innerText.length > 50) {
      alert('Your demand is too descriptive');
    }
  })

  if(demandsResults[0]) {
    console.log("ordered results are" + JSON.stringify(demandsResults));
    let displayedQuestion1 = demandsResults[0];
    demandResult1.innerHTML = displayedQuestion1.question;

    if (displayedQuestion1.requested == 1) {
      requestButton1.innerHTML = "Requested";
      requestButton1.disabled = true;
      requestButton1.style.backgroundColor = colors.requested;
    } else {
    requestButton1.innerHTML = "Request";
    requestButton1.addEventListener('click', async function(tab) {
      requestButton1.innerHTML = "Requested";
      requestButton1.disabled = true;
      requestButton1.style.backgroundColor = colors.requested;
      registerDemand(brandDocId,displayedQuestion1,fullid);
    });
    }

    if(demandsResults[1]) {
      let displayedQuestion1 = demandsResults[1];
      demandResult2.innerHTML = displayedQuestion1.question;
      if (displayedQuestion1.requested == 1) {
        requestButton2.innerHTML = "Requested";
        requestButton2.disabled = true;
        requestButton2.style.backgroundColor = colors.requested;
      } else {
      requestButton2.innerHTML = "Request";
      requestButton2.addEventListener('click', async function(tab) {
        requestButton2.innerHTML = "Requested";
        requestButton2.disabled = true;
        requestButton2.style.backgroundColor = colors.requested;
        registerDemand(brandDocId,displayedQuestion1,fullid);
      });
      }
      if (demandsResults[2]) { 
        let nb = demandsResults.length;
        demandPanel2.style.display = "block";
        demandPanel1.style.display = "block";
        demandPanelDropdown.style.display = "block"
        demandPanelInput.style.display = "none"
        demandCreate.addEventListener('click', function(tab) {
          demandPanelInput.style.display = "block"
          demandPanelDropdown.style.display = "none"
        })
        for (let i = 2; i < 3; i ++) {
          if (demandsResults[i]) {
            let answeredQuestion = demandsResults[i];
            let optionButton = dropdownButtons[i-2];
            optionButton.innerHTML = answeredQuestion.question;
            optionButton.style.display = "block";
            optionButton.addEventListener('click', function(tab) {
              demandPanelDropdown.style.display = "none"
              demandPanel3.style.display = "block"
              demandResult3.innerHTML = answeredQuestion.question
              requestButton3.innerHTML = "Request"
              requestButton3.addEventListener('click', function(tab) {
                registerDemand(brandDocId,answeredQuestion,fullid);
                requestButton3.innerHTML = "Requested";
                requestButton3.disabled = true;
                requestButton3.style.backgroundColor = colors.requested;
              })
            })
          } else {
            option.style.display = "none";
          }
        }
      } else {
        demandPanelDropdown.style.display = "none";
        demandPanelInput.style.display = "block"
      }
    } else {
      console.log('no second question for this brand');
      demandPanel2.style.display = "none";
      demandPanelDropdown.style.display = "none";
      demandPanelInput.style.display = "block";
    }
  } else {
    demandPanel2.style.display = "none";
    demandPanel1.style.display = "none";
    demandPanelDropdown.style.display = "none"
    demandPanelInput.style.display = "block"
  }
}

async function displayTrophies(results, websiteName, name, fullid, trophiesPanel) {
  const trophiesPanel1 = document.getElementById('trophies1');
  const trophiesResult1 = document.getElementById('postTrophiesResults1');
  const requestButton1 = document.getElementById("requestButton1");
  const trophiesPanel2 = document.getElementById('trophies2');
  const trophiesResult2 = document.getElementById('postDemandResults2')
  const requestButton2 = document.getElementById("requestButton2");

  const trophiesPanelDropdown = document.getElementById('trophiesDropdown');
  const dropdownItems = document.querySelector('.dropdown-menu');
  const trophiesOption1 = document.getElementById('option1');
  //const demandOption2 = document.getElementById('option2');
  //const demandOption3 = document.getElementById('option3');
  var dropdownButtons = [trophiesOption1];
  const trophiesCreate =  document.getElementById('createTrophies');

  const trophiesPanelInput = document.getElementById('trophiesInput');
  const inputButton = document.getElementById('inputButton');
  const trophiesresultsCustom = document.getElementById('postTrophiesResultsCustom');
  const trophiesCustomRequest = $("input:text");

  const collection = 'trophies';
  const trophiesResults = await publishContent(results,fullid,collection);
  trophiesPanel.style.display = "block";

  inputButton.addEventListener('click', function(tab) {
    console.log('to do');
    let customTrophies = trophiesCustomRequest.val();
    if (customDemand.length > 20 && customTrophies.length < 50 ) {
      if (results.new_brand == true) {
        registerNewBrand(websiteName, name, customTrophy, fullid, collection)
      } else {
      registerNewDemand(brandDocId, customTrophy ,fullid, collection);
      }
    trophiesPanelInput.style.display = "none"
    trophiesPanel2.style.display = "block"
    trophiesResult2.innerHTML = customTrophy;
    requestButton2.innerHTML = "Requested";
    requestButton2.disabled = true;
    requestButton2.style.backgroundColor = colors.requested;
    } else if (trophiesCreate.innerText.length > 20 ){
      alert('Your demand is not descriptive enough');
    } else if (trophiesCreate.innerText.length > 50) {
      alert('Your demand is too descriptive');
    }
  })

  if(trophiesResults[0]) {
    console.log("ordered results are" + JSON.stringify(demandsResults));
    let displayedTrophy = trophiesResults[0];
    trophiesResult1.innerHTML = displayedTrophy.question;

    if (displayedTrophy.requested == 1) {
      requestButton1.innerHTML = "Requested";
      requestButton1.disabled = true;
      requestButton1.style.backgroundColor = colors.requested;
    } else {
    requestButton1.innerHTML = "Request";
    requestButton1.addEventListener('click', async function(tab) {
      requestButton1.innerHTML = "Requested";
      requestButton1.disabled = true;
      requestButton1.style.backgroundColor = colors.requested;
      registerDemand(brandDocId,displayedQuestion1,fullid,collection);
    });
    }

    if(trophiesResults[1]) {
        let nb = trophiesResults.length;
        trophiesPanel1.style.display = "block";
        trophiesPanel2.style.display = "none";
        trophiesPanelDropdown.style.display = "block"
        trophiesPanelInput.style.display = "none"
        trophiesCreate.addEventListener('click', function(tab) {
          trophiesPanelInput.style.display = "block"
          trophiesPanelDropdown.style.display = "none"
        })
        for (let i = 1; i < 2; i ++) {
          if (demandsResults[i]) {
            let answeredTrophy = trophiesResults[i];
            let optionButton = dropdownButtons[i-2];
            optionButton.innerHTML = answeredTrophy.question;
            optionButton.style.display = "block";
            optionButton.addEventListener('click', function(tab) {
              trophiesPanelDropdown.style.display = "none"
              trophiesPanel2.style.display = "block"
              trophiesResult2.innerHTML = answeredQuestion.question
              requestButton2.innerHTML = "Request"
              requestButton2.addEventListener('click', function(tab) {
                registerDemand(brandDocId,answeredQuestion,fullid, collection);
                requestButton3.innerHTML = "Requested";
                requestButton3.disabled = true;
                requestButton3.style.backgroundColor = colors.requested;
              })
            })
          } else {
            option.style.display = "none";
          }
        }
      } else {
        trophiesPanelDropdown.style.display = "none";
        dtrophiesPanelInput.style.display = "block"
      }
  } else {
    trophiesPanel2.style.display = "none";
    trophiesPanel1.style.display = "none";
    trophiesPanelDropdown.style.display = "none"
    trophiesPanelInput.style.display = "block"
  }
}

// demand functions

function registerNewBrand(websiteName, name, customDemand, fullid, collection) {
  ///////// ADD IF BRAND DOES NOT EXIST \\\\\\\\\\\\\\
  let brandRef = db.collection('brands');
  let addBrand = brandRef.add({
    name: websiteName,
    small_business: 'new',
    websites: [websiteName],
    name: name
  }).then(function(docRef) {
    let questionRef = db.collection('brands').doc(docRef.id).collection(collection);
    questionRef.add({
      upvote: 1,
      question: customDemand,
    }).then(function(docRef2) {
      let ref = docRef2.id;
      let demandRef = db.collection('brands').doc(docRef.id).collection(collection).doc(ref).collection('demands').doc(fullid);
      demandRef.set({
        upvote: 1 
      })
    })
  })
}
function registerNewDemand(brandDocId,customDemand, fullid, collection) {
  ///////// ADD IF BRAND DOES NOT EXIST \\\\\\\\\\\\\\
  let questionRef = db.collection('brands').doc(brandDocId).collection('questions');
  questionRef.add({
    upvote: 1,
    question: customDemand,
    new_demand: true
  }).then(function(docRef) {
    let ref = docRef.id;
    let demandRef = db.collection('brands').doc(brandDocId).collection(collection).doc(ref).collection('demands').doc(fullid);
    demandRef.set({
      upvote: 1 
    })
  })
}

function registerDemand(brandDocId, displayedQuestion1, fullid, collection) {
  let questionId = displayedQuestion1.questionId;
  let currentUpvotes = displayedQuestion1.upvote + 1;
  let demandRef = db.collection('brands').doc(brandDocId).collection(collection).doc(questionId).collection('demands').doc(fullid);
  demandRef.set({
    upvote: 1 
  })
  let upvoteRef = db.collection('brands').doc(brandDocId).collection(collection).doc(questionId);
  var setWithMerge = upvoteRef.set({
    upvote: currentUpvotes
  }, { merge: true });
}

async function publishContent(results,fullid,collection){
  try{
    const brandDocId = results.docId;
    var sortedResults = [];
    if (brandDocId) {
    var demands = await checkQueries(brandDocId,fullid,collection);
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

    sortedResults = demandsResults.sort(function(a, b){
      return b.popularity-a.popularity
    });
  } 
  return sortedResults
  } catch(error) {
    console.log(error);
  }
};

async function checkQueries(brandDocId, fullid, collection) {
  try {
    var demands2 = [];
    let demands = await checkDemands(brandDocId,collection);
    console.log('demands in check queries' + JSON.stringify(demands));
    for (let i = 0; i < demands.length; i ++) {
      let demand2 = demands[i];
      let question = demand2.questionId;
      let userQuery = db.collection('brands').doc(brandDocId).collection(collection).doc(question).collection('demands').doc(fullid);
      let demandQuery = await userQuery.get()
      if (demandQuery.exists) {
        console.log('demands have been recorded by this user in check queries');
        let demand3 = demand2;
        demand3.requested = 1;
        demands2.push(demand3);
        console.log(demand3);
      } else {
        console.log('no demand recorded by this user in check queries');
        demands2.push(demand2);
        console.log(demand2);
      }
    }
    console.log(demands2);
    return demands2
  } catch(error) {
    console.log(error);
  }
}

async function checkDemands(brandDocId,collection){
  try{
    var demands = [];
    let demandQuery = db.collection('brands').doc(brandDocId).collection(collection)
    let querySnapshot = await demandQuery.get();
    if (!querySnapshot.empty) {
      console.log('query in checkdemands is not empty');
      querySnapshot.forEach(doc => { //if brand exists
        const demand = {"name": doc.data().name , question: doc.data().question, "upvote": doc.data().upvote, "downvote": doc.data().downvote, "questionId": doc.id};
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
      displayProfileLink(results.yahoo_uid)
      detailsButton.style.display = "block"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    } else if (results.hasEsg == true) {
      let answer =  (
      "This website belongs to " + results.name +
      ":<br>\u2022 ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
      ")<br>\u2022 Environmental risk: "+ results.yahoo_envrisk
      );
      displayEsgLink(results.yahoo_uid)
      detailsButton.style.display = "block"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    }
  }
}

function displayProfileLink(yahooCode) {
  const urlBusiness = "https://finance.yahoo.com/quote/";
  const urlProfiledata = "/profile";
  const link = urlBusiness + yahooCode + urlProfiledata;
  
  detailsButton.addEventListener('click', function(tab) {
    window.open(link)
    console.log('clicked')
  });
  }

  function displayEsgLink(yahooCode) {
    const urlBusiness = "https://finance.yahoo.com/quote/";
    const urlEsgdata = "/sustainability";
    const link = urlBusiness + yahooCode + urlEsgdata;
    
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