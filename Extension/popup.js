import regeneratorRuntime from 'regenerator-runtime/runtime';
import {findWebsiteName} from './general.js';
import $ from 'jquery';
import * as firebase from 'firebase/app'
import {auth} from 'firebase/auth';
//import {firestore} from 'firebase/firestore'
import * as bootstrap from 'bootstrap'
import {checkBusinessData} from './firebase.js';
import {registerNewDemand} from './firebase.js';
import {registerDemand} from './firebase.js';
import {registerNewBrand} from './firebase.js';
import {checkQueries} from './firebase.js';
import {login} from './firebase.js';


const colors = {
  "requested": "#afafaf"
};

chrome.tabs.query({active: true, currentWindow: true}, async function (tabs) {

  // identify website
  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  const websiteName = await findWebsiteName(currentURL);
  
  chrome.storage.sync.get(websiteName, async function(result) {
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    let results = await result[websiteName];
    if(results) {
      console.log('displaying content from stroage')
      console.log('results in popup from storage are ' + JSON.stringify(results));
      displayContent (websiteName, results);
    } else {
      console.log('no data in storage');
      let brand = {};
      brand.name = websiteName;
      brand.website = websiteName;
      console.log(brand)
      let results2 = await checkBusinessData(brand);
      console.log("results2 from DB are : " + JSON.stringify(results2));
      displayContent (websiteName, results2);
    }
  });
})

async function displayContent (websiteName, results) {
  let user = firebase.auth().currentUser; 
  const detailsButton = document.getElementById('detailsButton');
  const demandPanel = document.getElementById('demands');
  demandPanel.style.display = "none";
  const trophiesPanel = document.getElementById('trophies');
  trophiesPanel.style.display = "none";

  console.log('content to display: ' + JSON.stringify(results))

  // display esg
  let answer = await displayEsg(results);
  document.getElementById("postEsgResults").innerHTML = answer;

  //display content if user is logged in
  firebase.auth().onAuthStateChanged(async function(user) {
    if (user) {
      console.log('user logged in');
      user.providerData.forEach(async function (profile) {
        const fullid = profile.uid;
        console.log("userID from popup: " + fullid );
        displayDemand(results, websiteName, fullid);
        displayTrophies(results, websiteName, fullid);
      })
    } else {
      let status = await login();
      console.log('user TO BE logged in');
      if (status == true) {
      user.providerData.forEach(async function (profile) {
        const fullid = profile.uid;
        console.log("userID: " + fullid );
      })
    } else {
      console.log('user could not login via Chrome');
    }
  }
})
}

// massive display functions 
async function displayDemand(results, websiteName, fullid) {
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
  const demandOption1 = document.getElementById('demandOption');
  const demandOption2 = document.getElementById('demandOption1');
  const demandOption3 = document.getElementById('demandOption2');
  const demandOption4 = document.getElementById('demandOption3');
  const demandOption5 = document.getElementById('demandOption4');
  const dropdownButtons = [demandOption1,demandOption2,demandOption3,demandOption4,demandOption5];
  const demandCreate =  document.getElementById('createDemand');

  const demandPanelInput = document.getElementById('demandsInput');
  const inputButton = document.getElementById('inputButton');
  const demandresultsCustom = document.getElementById('postDemandResultsCustom');
  const demandCustomRequest = $("input[name*='demands']")

  const collection = 'questions';
  const demandsResults = await publishContent(results, fullid ,collection);
  console.log(demandsResults)
  const demandPanel = document.getElementById('demands');
  demandPanel.style.display = "block"
  demandPanel3.style.display = "none"


  let brandDocId = results.docId;

  inputButton.addEventListener('click', async function(tab) {
    let customDemand = demandCustomRequest.val();
    let languageIssue = await validateWording(customDemand, 15, 45)
    if (languageIssue == "none") {
      if (!results.docId) {
        registerNewBrand(websiteName, customDemand, fullid, collection)
      } else {
        registerNewDemand(brandDocId, customDemand ,fullid, collection);
      }
      demandPanelInput.style.display = "none";
      demandPanel3.style.display = "block";
      demandResult3.innerHTML = customDemand;
      requestButton3.innerHTML = "Requested";
      requestButton3.disabled = true;
      requestButton3.style.backgroundColor = colors.requested;
    }
  })

  if(demandsResults[0]) {
    let answeredQuestion = demandsResults[0];
    displaySection(demandPanel1, demandResult1, requestButton1, answeredQuestion, fullid, collection, brandDocId);

    if(demandsResults[1]) {
      let answeredQuestion = demandsResults[1];
      displaySection(demandPanel2, demandResult2, requestButton2, answeredQuestion, fullid, collection, brandDocId);
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
        for (let i = 2; i < 7; i ++) {
          let optionButton = dropdownButtons[i-2];
          if (demandsResults[i]) {
            let answeredQuestion = demandsResults[i];
            optionButton.innerHTML = answeredQuestion.question;
            if (answeredQuestion.requested == 1) {
              optionButton.style.color = colors.requested;
            } else {
              optionButton.style.display = "block";
            }
            optionButton.addEventListener('click', function(tab) {
              demandPanelDropdown.style.display = "none";
              displaySection(demandPanel3, demandResult3, requestButton3, answeredQuestion, fullid, collection, brandDocId);
            })
          } else {
            optionButton.remove();
          }
        }
      } else {
        demandPanelDropdown.style.display = "none";
        demandPanelInput.style.display = "block"
      }
    } else {
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

async function displayTrophies(results, websiteName, fullid,) {
  const trophiesPanel1 = document.getElementById('trophies1');
  const trophiesResult1 = document.getElementById('postTrophiesResults1');
  const requestTButton1 = document.getElementById("requestTButton1");
  const trophiesPanel2 = document.getElementById('trophies2');
  const trophiesResult2 = document.getElementById('postTrophiesResults2')
  const requestTButton2 = document.getElementById("requestTButton2");

  const trophiesPanelDropdown = document.getElementById('trophiesDropdown');
  const trophiesOption1 = document.getElementById('trophiesOption');
  const trophiesOption2 = document.getElementById('trophiesOption1');
  const trophiesOption3 = document.getElementById('trophiesOption2');
  const trophiesOption4 = document.getElementById('trophiesOption3');
  const trophiesOption5 = document.getElementById('trophiesOption4');
  const dropdownTrophies = [trophiesOption1,trophiesOption2,trophiesOption3,trophiesOption4,trophiesOption5];
  const trophiesCreate =  document.getElementById('createTrophy');

  const trophiesPanelInput = document.getElementById('trophiesInput');
  const inputTButton = document.getElementById('inputTButton');
  const trophiesresultsCustom = document.getElementById('postTrophiesResultsCustom');
  const inputTrophies = document.getElementById('inputTrophies');
  const trophiesCustomRequest = $("input[name*='trophies']")

  const collection = 'trophies';
  const trophiesResults = await publishContent(results, fullid ,collection);
  const trophiesPanel = document.getElementById('trophies');
  trophiesPanel.style.display = "block";

  let brandDocId = results.docId;

  inputTButton.addEventListener('click', async function(tab) {
    let customTrophies = trophiesCustomRequest.val();
    let languageIssue = await validateWording(customTrophies, 10, 40);
    if (languageIssue == "none") {
      if (!results.docId) {
        registerNewBrand(websiteName, customTrophies, fullid, collection)
      } else {
        registerNewDemand(brandDocId, customTrophies ,fullid, collection);
      }
      trophiesPanelInput.style.display = "none";
      trophiesPanel2.style.display = "block";
      trophiesResult2.innerHTML = customTrophies;
      requestTButton2.innerHTML = "Supported";
      requestTButton2.disabled = true;
      requestTButton2.style.backgroundColor = colors.requested;
    }
  })

  if(trophiesResults[0]) {
    let answeredQuestion = trophiesResults[0];
    displaySection(trophiesPanel1, trophiesResult1, requestTButton1, answeredQuestion, fullid, collection, brandDocId);

    if(trophiesResults[1]) {
        let nb = trophiesResults.length;
        trophiesPanelDropdown.style.display = "block"
        trophiesPanel2.style.display = "none";
        trophiesPanelInput.style.display = "none"
        trophiesCreate.addEventListener('click', function(tab) {
          trophiesPanelInput.style.display = "block"
          trophiesPanelDropdown.style.display = "none"
        })
        for (let i = 1; i < 6; i ++) {
          let optionButton = dropdownTrophies[i-1];
          if (trophiesResults[i]) {
            let answeredTrophy = trophiesResults[i];
            optionButton.innerHTML = answeredTrophy.question;
            optionButton.style.display = "block";
            if (answeredTrophy.requested == 1) {
              optionButton.style.color = colors.requested;
            } else {
              optionButton.style.display = "block";
            }
            optionButton.addEventListener('click', function(tab) {
              trophiesPanelDropdown.style.display = "none"
              displaySection(trophiesPanel2, trophiesResult2, requestTButton2, answeredQuestion, fullid, collection, brandDocId);
            })
          } else {
            optionButton.remove();
          }
        }
      } else {
        trophiesPanel2.style.display = "none";
        trophiesPanelDropdown.style.display = "none";
        trophiesPanelInput.style.display = "block";
      }
  } else {
    trophiesPanel2.style.display = "none";
    trophiesPanel1.style.display = "none";
    trophiesPanelDropdown.style.display = "none";
    trophiesPanelInput.style.display = "block";
  }
}

// display functions
function displaySection(demandPanel, demandResult, requestButton, answeredQuestion, fullid, collection, brandDocId) {
  demandPanel.style.display = "block"
  demandResult.innerHTML = answeredQuestion.question
  let demands = {
    'questions': 'Request',
    'trophies': 'Support'
  };
  let answers = {
    'questions': 'Requested',
    'trophies': 'Supported'
  };
  if (answeredQuestion.requested == 1) {
    requestButton.innerHTML = answers[collection];
    requestButton.disabled = true;
    requestButton.style.backgroundColor = colors.requested;
  } else {
    requestButton.innerHTML = demands[collection];
    requestButton.addEventListener('click', function(tab) {
      registerDemand(brandDocId,answeredQuestion, fullid, collection);
      requestButton.innerHTML = answers[collection];
      requestButton.disabled = true;
      requestButton.style.backgroundColor = colors.requested;
    })
  }
}

async function validateWording (customTrophies, min, max) {
  try {
    const languageIssue = await checkLanguage(customTrophies);
    if (languageIssue == true) {
      alert('Watch your language, please');
      let wordingIssue = languageIssue;
      return wordingIssue
    } else {
      if (customTrophies.length < min) {
        let wordingIssue ="short";
        alert('This is not descriptive enough');
        return wordingIssue
      } else if (customTrophies.length > max) {
        let wordingIssue = "long";
        alert('Try to make it a bit shorter');
        return wordingIssue
      } else {
        let wordingIssue = "none"
        return wordingIssue
      }
    } 
  } catch(error) {
    console.log(error); 
  }
}

async function checkLanguage(customTrophies) {
  const issues = ["suck","fuck","shit","faggot","dick","bowls","ass","pute","cul","chienne","mère","fils de","cock", "bitch", "salope", "cunt"];
  for (let i=0;i<issues.length;i++) {
    let word = issues[i];
    if (customTrophies.indexOf(word) > -1 ) {
      return true
    } 
  }
  return false
}

async function publishContent(results, fullid, collection){
  try{
    const brandDocId = results.docId;
    var sortedResults = [];
    if (brandDocId) {
    var demands = await checkQueries(brandDocId, fullid, collection);
    console.log('checkQueries: ' + checkQueries);
    const nb = demands.length;
    var demandsResults = [];
    console.log('demands in publish' + JSON.stringify(demands));

    for (let i = 0; i < nb; i ++) {
      const question = await demands[i];
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

//functions esg
function displayEsg(results) {
  if(results.hasBusiness_ref == false) {
    if(results.private) {
      if(results.business_name) {
        let answer =   (
        "This website belongs to <b>" + results.business_name + "</b>, a <b>private company</b>.<br>We could not access their ESG risk report."
        ); 
        displayPrivateLink(results.private)
        detailsButton.style.display = "block";
        document.getElementById("postEsgResults").innerHTML = answer;
        return answer
      } else {
        let answer =   (
        "This website belongs to <b>" + results.brand_name + "</b>, a <b>private company</b>.<br>We could not access their ESG risk report."
        ); 
        displayPrivateLink(results.private)
        detailsButton.style.display = "block";
        document.getElementById("postEsgResults").innerHTML = answer;
        return answer
      }
    } else if (results.local == true) {
      let answer =  (
      "<b>" + results.brand_name +"</b> is a <b>local business</b>.<br>ESG risk reports are ususally not available for local businesses."
      ); 
      detailsButton.style.display = "none"
      return answer
    } else {  
      let answer =  (
      "We do not have official information about this website, yet."
      ); 
      detailsButton.style.display = "none"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    }
  } else {
    if (results.hasEsg == false) {
      let answer = (
      "This website belongs to <b>"+ results.business_name + "</b>: a <b>public company</b>." +
      "<br>Unlike most public companies, <b>their ESG risk report is not available</b> on their profile."
      );
      displayProfileLink(results.yahoo_uid);
      detailsButton.style.display = "block";
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    } else if (results.hasEsg == true) {
      if (results.yahoo_controverse && results.yahoo_controverse > 3) {
        let answer =  (
          "This website belongs to <b>" + results.business_name +
          "</b>:<br>\u2022 ESG risk: <b>"+ results.yahoo_esg + "%</b> (" + results.yahoo_percentile +
          ").<br>\u2022 Environmental risk: <b>"+ results.yahoo_envrisk + "</b>." +
          "<br></br><b> The controversy on this data is very high</b>"
          );
          displayEsgLink(results.yahoo_uid)
          detailsButton.style.display = "block"
          document.getElementById("postEsgResults").innerHTML = answer;
          return answer
      } else {
        let answer =  (
          "This website belongs to <b>" + results.business_name +
          "</b>:<br>\u2022 ESG risk: <b>"+ results.yahoo_esg + "%</b> (" + results.yahoo_percentile +
          ").<br>\u2022 Environmental risk: <b>"+ results.yahoo_envrisk + "</b>."
        );
        displayEsgLink(results.yahoo_uid)
        detailsButton.style.display = "block"
        document.getElementById("postEsgResults").innerHTML = answer;
        return answer
      }
    }
  }
}

function displayPrivateLink(privacy) {
  const urlBusiness = "https://www.crunchbase.com/organization/";
  const link = urlBusiness + privacy;
  
  detailsButton.addEventListener('click', function(tab) {
    window.open(link)
  });
}

function displayProfileLink(yahooCode) {
  const urlBusiness = "https://finance.yahoo.com/quote/";
  const urlProfiledata = "/profile";
  const link = urlBusiness + yahooCode + urlProfiledata;
  
  detailsButton.addEventListener('click', function(tab) {
    window.open(link)
  });
}

  function displayEsgLink(yahooCode) {
    const urlBusiness = "https://finance.yahoo.com/quote/";
    const urlEsgdata = "/sustainability";
    const link = urlBusiness + yahooCode + urlEsgdata;
    
    detailsButton.addEventListener('click', function(tab) {
      window.open(link)
    });
    }