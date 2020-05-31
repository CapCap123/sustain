
import * as firebase from 'firebase/app'
import {firestore} from 'firebase/firestore'
//import {firestore} from ''
//import * as admin from 'firebase-admin'
//import * as functions from 'firebase-functions'


var config = {
    apiKey: 'AIzaSyBrJTjQo6gZ6UX_iTo8z1muvrIoMxkXvwo',
    authDomain: 'sustainability-4ae3a.firebaseapp.com',
    projectId: 'sustainability-4ae3a'
  };
  
  firebase.initializeApp(config);

  let db = firebase.firestore();

  console.log('firebase initialized')

  module.exports = db;

/*
  var refreshToken; // Get refresh token from OAuth2 flow

  admin.initializeApp({
    credential: admin.credential.refreshToken(refreshToken),
    databaseURL: 'https://sustainability-4ae3a.firebaseio.com'
  });

  let serviceAccount = require('../keys/servicekey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let firestore = admin.firestore();

  */




  