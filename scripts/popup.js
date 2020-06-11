import regeneratorRuntime from 'regenerator-runtime/runtime';
import {findWebsiteName} from './general.js';
import $ from 'jquery';
import * as firebase from 'firebase/app'
import {auth} from 'firebase/auth';
import {firestore} from 'firebase/firestore'

var config = {
  apiKey: '',
  authDomain: 'sustainability-4ae3a.firebaseapp.com',
  projectId: 'sustainability-4ae3a'
  };
firebase.initializeApp(config);
let db = firebase.firestore();

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
      displayContent (websiteName, results)
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


// massive function display

async function displayContent (websiteName, results) {
  let user = firebase.auth().currentUser; 
  const detailsButton = document.getElementById('detailsButton');
  const demandPanel = document.getElementById('demands');
  demandPanel.style.display = "none";
  const trophiesPanel = document.getElementById('trophies');
  trophiesPanel.style.display = "none";

  console.log('content to display: ' + JSON.stringify(results))
  console.log("results are " + JSON.stringify(results));
  let brandDocId = results.docId;

  // display esg
  let answer = await displayEsg(results);
  document.getElementById("postEsgResults").innerHTML = answer;

  //display content if user is logged in
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
  
}
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
    let customDemand = demandCustomRequest.val();
    if (customDemand.length > 20 && customDemand.length < 50 ) {
      if (results.new_brand == true) {
        registerNewBrand(websiteName, name, customDemand, fullid, collection)
      } else {
      registerNewDemand(brandDocId, customDemand ,fullid, collection);
      }
    demandPanelInput.style.display = "none"
    demandPanel3.style.display = "block"
    demandResult3.innerHTML = customDemand;
    requestButton3.innerHTML = "Requested";
    requestButton3.disabled = true;
    requestButton3.style.backgroundColor = colors.requested;
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
      registerDemand(brandDocId,displayedQuestion1,fullid,collection);
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
        registerDemand(brandDocId,displayedQuestion1,fullid,collection);
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
                registerDemand(brandDocId,answeredQuestion,fullid,collection);
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
  const requestTButton1 = document.getElementById("requestTButton1");
  const trophiesPanel2 = document.getElementById('trophies2');
  const trophiesResult2 = document.getElementById('postDemandResults2')
  const requestTButton2 = document.getElementById("requestTButton2");

  const trophiesPanelDropdown = document.getElementById('trophiesDropdown');
  const dropdownItems = document.querySelector('.dropdown-menu');
  const trophiesOption1 = document.getElementById('option1');
  //const demandOption2 = document.getElementById('option2');
  //const demandOption3 = document.getElementById('option3');
  var dropdownButtons = [trophiesOption1];
  const trophiesCreate =  document.getElementById('createTrophies');

  const trophiesPanelInput = document.getElementById('trophiesInput');
  const inputTButton = document.getElementById('inputTButton');
  const trophiesresultsCustom = document.getElementById('postTrophiesResultsCustom');
  const trophiesCustomRequest = $("input:text");

  const collection = 'trophies';
  const trophiesResults = await publishContent(results,fullid,collection);
  trophiesPanel.style.display = "block";

  inputTButton.addEventListener('click', async function(tab) {
    let customTrophies = trophiesCustomRequest.val();
    let language = await validateWording(customTrophies);
    console.log('language in function is: ' + JSON.stringify(language));
    if (language == "none") {
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
    console.log('no trophy to show');
    trophiesPanel2.style.display = "none";
    trophiesPanel1.style.display = "none";
    trophiesPanelDropdown.style.display = "none";
    trophiesPanelInput.style.display = "block";
  }
}

// demand functions
function registerNewBrand(websiteName, name, customDemand, fullid, collection) {
  let brandRef = db.collection('brands');
  let addBrand = brandRef.add({
    name: websiteName,
    small_business: 'new',
    websites: [websiteName],
    name: websiteName
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

async function validateWording (customTrophies) {
  try {
  console.log('rying to check language')
  //const languageIssue = await checkLanguage(customTrophies);
  //console.log("language issue in validate W: " + JSON.stringify(languageIssue));
    //if (languageIssue == 'language') {
      //let wordingIssue = 'language';
      //alert('Watch your language, please');
      //return wordingIssue
    //} else {
      if (customTrophies.length < 15) {
        let wordingIssue ="short";
        alert('This is not descriptive enough');
        return wordingIssue
      } else if (customTrophies.length > 40) {
        let wordingIssue = "long";
        alert('Try to make it a bit shorter');
        return wordingIssue
      } else {
        let wordingIssue = "none"
        console.log('NO language issue');
        return wordingIssue
    }
    //} 
  } catch(error) {
    console.log(error); 
  }
}

//functions esg
function displayEsg(results) {
  if(results.hasBusiness_ref == false) {
    if(results.private) {
      let answer =   (
        results.name + " is a private company. Official risks reports of public companies are ususally not public, or do not exist."
        ); 
        displayPrivateLink(results.private)
      detailsButton.style.display = "block";
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    } else {  
    let answer =  (
      "We did not find official information about "+ results.name + ", yet."
      ); 
      detailsButton.style.display = "none"
      document.getElementById("postEsgResults").innerHTML = answer;
      return answer
    }
  } else {
    if (results.hasEsg == false) {
      let answer = (
      "This website belongs to "+ results.name + ", which is public" +
      "<br>" + results.name + " did not make their information public"
      );
      displayProfileLink(results.yahoo_uid);
      detailsButton.style.display = "block";
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


function displayPrivateLink(privacy) {
  const urlBusiness = "https://www.crunchbase.com/organization/";
  const link = urlBusiness + privacy;
  
  detailsButton.addEventListener('click', function(tab) {
    window.open(link)
    console.log('clicked')
  });
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

async function checkBusinessData(brand) {
  try {   
    const matchedBusiness = await checkBrand(brand);
    const yahooCode = matchedBusiness.business_ref;
    console.log('yahoo code is ' + yahooCode)

    if (!yahooCode || yahooCode.length < 1) {
      console.log('no business ref found for this brand')
      var finalBusiness = matchedBusiness;
      finalBusiness.new_business = false;
      finalBusiness.hasBusiness_ref = false;
      finalBusiness.hasEsg = false;
    } else {
      let businessQuery = db.collection('businesses').where('yahoo_uid', '==',  yahooCode);
      let businessSnapshot = await businessQuery.get();        
      if (businessSnapshot.empty) {
        console.log('scraper for business needed');
        var finalBusiness = matchedBusiness;
        finalBusiness.new_business = false;
        finalBusiness.hasBusiness_ref = false;
        finalBusiness.hasEsg = false;
        finalBusiness.name = matchedBusiness.business_name;
        finalBusiness.brand_name = matchedBusiness.name  
      } else { 
        businessSnapshot.forEach(doc => {
          finalBusiness = doc.data();
          finalBusiness.new_business = false;
          finalBusiness.business_ref = matchedBusiness.yahoo_uid;
          finalBusiness.brand_name = matchedBusiness.name;
          finalBusiness.docId = matchedBusiness.docId;
          finalBusiness.hasBusiness_ref = true;
          finalBusiness.new_brand =  matchedBusiness.new_brand
          const esg = finalBusiness.yahoo_esg;
            if ((!esg) || (esg.length < 1)) {
              finalBusiness.hasEsg = false;
            } else {
              finalBusiness.hasEsg = true;
            }
        })
      }
    }
  } catch(error) {
    console.log(error);
  }
  console.log('finalBusiness is : ' + JSON.stringify(finalBusiness));
  return finalBusiness
}
//module.exports = { checkBusinessData };


async function checkBrand(brand) {
  try {
    const websiteName = brand.website;
    console.log('brand: ' + brand+' websiteName: ' + websiteName);
    let brandQuery = db.collection('brands').where('websites', 'array-contains',  websiteName);
    let querySnapshot = await brandQuery.get();
    if (querySnapshot.empty) {
      console.log('brand does not exist in db');
      brand.new_brand = true;        
    } else {
      brand.new_brand = false;     
      querySnapshot.forEach(doc => { //if brand exists
        const businessRef = doc.data().business_ref
        const businessName = doc.data().business_name
        const brandDocId = doc.id;
        brand.small_business = doc.data().small_business
        brand.docId = brandDocId;
        console.log('brand extracted is: ' + JSON.stringify(brand));
        if((!businessRef) || businessRef.empty) {
          console.log('this brand has no business ref')
          brand.hasEsg = false;
          brand.business_ref = "";      
        } else{
          brand.business_ref = businessRef;
          brand.business_name = businessName;
          brand.hasBusiness_ref = true;
          console.log('brand exists and has business ref')
        }
      })
    }
  } catch(error) {
    console.log(error)
  }
console.log('brand is : ' + JSON.stringify(brand));
return brand;
}