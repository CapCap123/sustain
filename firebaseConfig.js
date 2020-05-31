//import * as admin from 'firebase-admin';
//import 'firebase/auth';

//const debug = require('debug')('firestore-snippets-node');
//const admin = require('firebase-admin/lib');

let serviceAccount = require ("./keys/servicekey.json");

// We supress these logs when not in NODE_ENV=debug for cleaner Mocha output
//let console = {log: debug};

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sustainability-4ae3a.firebaseio.com"
});

export const app = firebase.initializeApp(firebaseConfig);