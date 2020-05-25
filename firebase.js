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

function recordBusiness (business) {
  let businessRef = firestore.collection('businesses');
  addBusiness = businessRef.add({
      yahoo_uid: business.yahoo_uid,
      name: business.name,
      yahoo_esg: business.yahoo_esg,
      yahoo_percentile: business.yahoo_percentile,
      yahoo_controverse: business.yahoo_controverse,
      yahoo_envrisk: business.yahoo_envrisk,
      small_business: business.small_business,
      yahoo_employees: business.employees,
      yahoo_sector: business.sector,
      yahoo_industry: business.industry,
    }).then(ref => {
      console.log('Added business with ID: ', ref.id);
    });
    return addBusiness.then(res => {
      console.log('Add: ', res);
    });
  }

  function recordBrand (brand) {
    let brandRef = firestore.collection('brands');
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

    module.exports = { recordBrand, recordBusiness };

//const settings = {timestampsInSnapshots: true};
//db.settings(settings);


    /*let docRef = firestore.collection('brands').doc('Paris');
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    */