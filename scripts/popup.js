import regeneratorRuntime from 'regenerator-runtime/runtime';
import {db} from './background.js';

chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
  const detailsButton = document.getElementById('detailsButton');
  const demandResult = document.getElementById('postDemandResults');
  const demandPanel = document.getElementById('demands');

  var currentTab = tabs[0]
  var currentURL = currentTab.url;
  let websiteName = findWebsiteName(currentURL);

  
  chrome.storage.sync.get(websiteName, async function(result) {
    // retrieve brand data
    console.log( websiteName + " results retrieved from storage in popup is " + result[websiteName]);
    const results = result[websiteName];
    console.log("results are " + JSON.stringify(results));
    const answer = sendAnswer(results); 

    //display esg data
    document.getElementById("postEsgResults").innerHTML = answer;
    if(results.hasBusiness_ref == true)  {
      const urlBusiness = "https://finance.yahoo.com/quote/";
      const yahooCode = results.yahoo_uid;
      const urlProfiledata = "/profile";
      const link = urlBusiness + yahooCode + urlProfiledata;

      detailsButton.addEventListener('click', function(tab) {
        window.open(link)
        console.log('clicked')
      });
    }

    //display question
    const demandsResults = await publishContent(await results);
    console.log("ordered results are" + JSON.stringify(demandsResults));
    const displayedQuestion = await demandsResults[0];
    if(displayedQuestion) {
      console.log('demand should be displayed');
      demandPanel.style.display = "block";
      demandResult.innerHTML = displayedQuestion.question;
    } else {
      console.log('demand will not be displayed');
      demandPanel.style.display = "none";
    }
  });
})

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