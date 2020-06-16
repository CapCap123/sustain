import * as firebase from 'firebase/app'
import {firestore} from 'firebase/firestore'
import {auth} from 'firebase/auth'

var config = {
    apiKey: "AIzaSyBrJTjQo6gZ6UX_iTo8z1muvrIoMxkXvwo",
    authDomain: "sustainability-4ae3a.firebaseapp.com",
    databaseURL: "https://sustainability-4ae3a.firebaseio.com",
    projectId: "sustainability-4ae3a",
    storageBucket: "sustainability-4ae3a.appspot.com",
    messagingSenderId: "915190118676",
    appId: "1:915190118676:web:7047070d6042c1d685aa01",
    measurementId: "G-0NH1RKVV78"
    };
  
  firebase.initializeApp(config);
  let db = firebase.firestore();
  //module.exports = { db };
  
  // firebase data
  async function checkBusinessData(brand) {
    try {   
      const matchedBusiness = await checkBrand(brand);
      const yahooCode = matchedBusiness.business_ref;
      console.log('yahoo code is ' + yahooCode)
  
      if (!yahooCode || yahooCode.length < 1) {
        console.log('no business ref found for this brand')
        var finalBusiness = matchedBusiness;
        finalBusiness.hasBusiness_ref = false;
        finalBusiness.hasEsg = false;
      } else {
        let businessQuery = db.collection('businesses').where('yahoo_uid', '==',  yahooCode);
        let businessSnapshot = await businessQuery.get();        
        if (businessSnapshot.empty) {
          console.log('scraper for business needed');
          var finalBusiness = matchedBusiness;
          finalBusiness.hasBusiness_ref = false;
          finalBusiness.hasEsg = false;
        } else { 
          businessSnapshot.forEach(doc => {
            finalBusiness = doc.data();
            finalBusiness.new_business = false;
            finalBusiness.hasBusiness_ref = true;
            finalBusiness.business_ref = matchedBusiness.yahoo_uid;
            finalBusiness.brand_name = matchedBusiness.name;
            finalBusiness.docId = matchedBusiness.docId;
            finalBusiness.new_brand =  matchedBusiness.new_brand;
            finalBusiness.local = matchedBusiness.local;
            finalBusiness.business_name = matchedBusiness.business_name;
            finalBusiness.small_business = matchedBusiness.small_business;
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

  async function checkBrand(brand) {
    try {
      const websiteName = brand.website;
      console.log('brand: ' + brand+' websiteName: ' + websiteName);
      let brandQuery = db.collection('brands').where('websites', 'array-contains',  websiteName);
      let querySnapshot = await brandQuery.get();
      if (querySnapshot.empty) {
        console.log('brand does not exist in db');
        brand.new_brand = true;     
        brand.small_business = "new";   
      } else {
        console.log('brand exists in db');  
        querySnapshot.forEach(doc => { //if brand exists
          const businessRef = doc.data().business_ref;
          brand.business_name = doc.data().business_name;
          brand.small_business = doc.data().small_business;
          brand.docId = doc.id;
          brand.private = doc.data().private;
          brand.new_brand = doc.data().small_business; 
          brand.local = doc.data().local; 
          brand.brand_name = doc.data().name
          console.log('brand extracted is: ' + JSON.stringify(brand));
          if((!businessRef) || businessRef.empty) {
            console.log('this brand has no business ref');
            brand.hasEsg = false;
            brand.business_ref = "";      
          } else{
            brand.business_ref = businessRef;
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

  //firebase content
async function registerNewBrand(websiteName, customDemand, fullid, collection) {
    let brandQuery = db.collection('brands').where('websites', 'array-contains',  websiteName);
      let querySnapshot = await brandQuery.get();
      if (querySnapshot.empty) {
        let brandRef = db.collection('brands');
        let addBrand = brandRef.add({
          name: websiteName,
          small_business: 'new',
          websites: [websiteName],
        }).then(function(docRef) {
          let ref = docRef.id
          let questionRef = db.collection('brands').doc(ref).collection(collection);
          questionRef.add({
            upvote: 1,
            question: customDemand,
          }).then(function(docRef2) {
            let ref2 = docRef2.id;
            let demandRef = db.collection('brands').doc(ref).collection(collection).doc(ref2).collection('demands').doc(fullid);
            demandRef.set({
              upvote: 1 
            })
          })
        })
      } else {
        querySnapshot.forEach(doc => { //if brand exists
          let brandDocId = doc.id;
          registerNewDemand(brandDocId,customDemand, fullid, collection)
        })
      }
  }
  
  function registerNewDemand(brandDocId,customDemand, fullid, collection) {
    let questionRef = db.collection('brands').doc(brandDocId).collection(collection);
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
  
  async function checkQueries(brandDocId, fullid, collection) {
    try {
      var demands2 = [];
      let demands = await checkDemands(brandDocId,collection);
      console.log('checkDemands: ' + checkDemands);
      for (let i = 0; i < demands.length; i ++) {
        let demand2 = demands[i];
        let question = demand2.questionId;
        let userQuery = db.collection('brands').doc(brandDocId).collection(collection).doc(question).collection('demands').doc(fullid);
        let demandQuery = await userQuery.get()
        if (demandQuery.exists) {
          let demand3 = demand2;
          demand3.requested = 1;
          demands2.push(demand3);
        } else {
          demands2.push(demand2);
        }
      }
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
        querySnapshot.forEach(doc => { //if brand exists
          const demand = {"name": doc.data().name , question: doc.data().question, "upvote": doc.data().upvote, "downvote": doc.data().downvote, "questionId": doc.id};
          demands.push(demand);
          console.log('doc: ' + checkQueries);
        })
      } else {}
    return demands
    } catch(error) {
      console.log(error);
    }
  };

  // login
async function login() {
    chrome.identity.getAuthToken({interactive: true}, function(token) {
    if (chrome.runtime.lastError) {
        alert(chrome.runtime.lastError.message);
        var status = "failed";
        return status;
    }
    var x = new XMLHttpRequest();
    x.open('GET', 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' + token);
    x.onload = function() {
        alert(x.response);
        var status = "success";
    };
    var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
    firebase.auth().signInWithCredential(credential);
    x.send();
    return status;
  });
  return true
  }

  module.exports = { checkBusinessData, registerNewDemand, registerNewBrand, registerDemand, checkQueries, login };
