
import * as firebase from 'firebase/app'
import {firestore} from 'firebase/firestore'
import {checkBusinessData} from './checkdata.js';
import regeneratorRuntime from 'regenerator-runtime/runtime';
//import { ResultStorage } from 'firebase-functions/lib/providers/testLab';
//import { request } from 'express';

var config = {

  };
  
  firebase.initializeApp(config);

  let db = firebase.firestore();

  console.log('firebase initialized')

  module.exports = db;

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0];
    if (!currentTab) {
      console.log("current tab undefined")
    } else {
      console.log('message sent');
      //chrome.tabs.executeScript(tabs[0].id, {file: "esg.js"}, function() {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello", tab: currentTab}, async function(response) {
          let answer = await response;
          if(answer){
            alert(answer);
            console.log(answer);
          } else {
            console.log('response did not come')
          }
        });
      //}); 
    }
  })


