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
let brandRef = firestore.collection('brands');
  
  function recordBrand (brand) {
    if(!brand.business_ref) {
      console.log('no brand to record')
    } else {
    console.log('brand to be added to db' + JSON.stringify(brand));
    addBrand = brandRef.add({
      name: brand.name,
      business_ref: brand.business_ref,
      small_business: 'yes',
      }).then(ref => {
        console.log('Added brand with ID: ', ref.id);
      });
      return addBrand.then(res => {
        console.log('Add: ', res);
      });
    }
  }


  module.exports = recordBrand;