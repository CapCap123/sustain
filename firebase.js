const debug = require('debug')('firestore-snippets-node');

// [START firestore_deps]
const admin = require('firebase-admin');
// [END firestore_deps]

// We supress these logs when not in NODE_ENV=debug for cleaner Mocha output
let console = {log: debug};

// Fetch the service account key JSON file contents
let serviceAccount = require("/Users/Capucine/Desktop/Platform/Code/Firebase/servicekey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sustainability-4ae3a.firebaseio.com"
});

var firestore = admin.firestore()
//const settings = {timestampsInSnapshots: true};
//db.settings(settings);

let businessRef = firestore.collection('businesses')
//let brandRef = firestore.collection('brands')

function recordBusiness (business) {
    if (!business.yahoo_uid) {
      console.log('no business to be added');
    } else {
    addBusiness = businessRef.add({
    //addBusiness = businessRef.add({
      yahoo_uid: business.yahoo_uid,
      name: business.name,
      yahoo_esg: business.yahoo_esg,
      yahoo_percentile: business.yahoo_percentile,
      yahoo_controverse: business.yahoo_controverse,
      yahoo_envrisk: business.yahoo_envrisk,
      small_business: business.small_business
    }).then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
    return addBusiness.then(res => {
      console.log('Add: ', res);
    });
  }
  }
/*
  function recordBrand (brand) {
    addBrand = brandRef.add({
    //addBusiness = businessRef.add({
      name: brand.name,
      business_ref: brand.business_ref,
      small_business: brand.small_business
    }).then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
    return addBusiness.then(res => {
      console.log('Add: ', res);
    });
  }
  */

  module.exports = recordBusiness;
  //module.exports = recordBrand;

    /*let docRef = firestore.collection('brands').doc('Paris');
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });*/