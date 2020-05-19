// Firebase App (the core Firebase SDK) is always required and
// must be listed before other Firebase SDKs
var firebase = require("firebase/app");

// Add the Firebase products that you want to use
require("firebase/auth");
require("firebase/firestore");

// TODO: Replace the following with your app's Firebase project configuration
var firebaseConfig = {
    apiKey: "AIzaSyBrJTjQo6gZ6UX_iTo8z1muvrIoMxkXvwo",
    authDomain: "sustainability-4ae3a.firebaseapp.com",
    databaseURL: "https://sustainability-4ae3a.firebaseio.com",
    projectId: "sustainability-4ae3a",
    storageBucket: "sustainability-4ae3a.appspot.com",
    messagingSenderId: "915190118676",
    appId: "1:915190118676:web:7047070d6042c1d685aa01",
    measurementId: "G-0NH1RKVV78"
  };
  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

