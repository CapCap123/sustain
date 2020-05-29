const debug = require('debug')('firestore-snippets-node');
const admin = require('firebase-admin');

// Fetch the service account key JSON file contents
//let data = process.env.GOOGLE_CONFIG_BASE64;
//let buff = Buffer(JSON.stringify(data), 'base64');
//let text = buff.toString('ascii');
//console.log(text);
let serviceAccount = require ("/Users/Capucine/Desktop/Platform/Code/Firebase/servicekey.json");

// We supress these logs when not in NODE_ENV=debug for cleaner Mocha output
let console = {log: debug};

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sustainability-4ae3a.firebaseio.com"
});

var firestore = admin.firestore()

function saveBusiness (business) {
  let businessRef = firestore.collection('businesses');
  addBusiness = businessRef.add({
    yahoo_uid: business.business_ref,
    yahoo_esg: business.yahoo_esg,
    name: business.business_name,
    yahoo_percentile: business.yahoo_percentile,
    yahoo_controverse: business.yahoo_controverse,
    yahoo_envrisk: business.yahoo_envrisk,
    yahoo_employees: business.employees,
    yahoo_sector: business.sector,
    yahoo_industry: business.industry,
    new_business: 'yes',
  }).then(ref => {
    console.log('Added business with ID: ', ref.id);
  });
  return addBusiness.then(res => {
    console.log('Add: ', res);
  });
}

  function saveBrand (brand) {
    let brandRef = firestore.collection('brands');
    let parent = brand.business_ref;
    console.log('brand to be added to db' + JSON.stringify(brand));
    if (parent == '') {
      addBrand = brandRef.add({
        name: brand.name,
        small_business: 'new',
        websites: [brand.website],
      }).then(ref => {
        console.log('Added brand with ID: ', ref.id);
      });
      return addBrand.then(res => {
        console.log('Add: ', res);
      });
    } else {
      addBrand = brandRef.add({
        name: brand.name,
        small_business: 'new',
        business_name: brand.business_name,
        business_ref: brand.business_ref,
        websites: [brand.website],
      }).then(ref => {
        console.log('Added brand with ID: ', ref.id);
      });
      return addBrand.then(res => {
        console.log('Add: ', res);
      });
    }
  }

  module.exports = { saveBrand, saveBusiness };

//const settings = {timestampsInSnapshots: true};
//db.settings(settings);


    /*let docRef = firestore.collection('brands').doc('Paris');
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });
    */