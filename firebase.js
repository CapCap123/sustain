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
    //var data = business.yahooData
    //var dataBrand = brand.brandname
    addBusiness = businessRef.add({
      Scraper: business
    }).then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
    return addBusiness.then(res => {
      console.log('Add: ', res);
    });
  }

  module.exports = recordBusiness;
/*
function recordBrand (brand) {
      var data = brand
      addBrand = brandRef.add({
        yahoo_Ref: data
      }).then(ref => {
        console.log('Added document with ID: ', ref.id);
      });
      return addBrand.then(res => {
        console.log('Add: ', res);
      });
    };
    */

    /*
    let setDoc = firestore.collection('cities').doc('Pars').set(data);

    return setDoc.then(res => {
      console.log('Set: ', res);
    });
    */

  // can also be writtem const docRef = firestore.collection("businesses/businessData")
//let businessRef = firestore.collection("businesses").doc(docName);
//let docName = JSON.stringify(business.yahooData.esgCode);


//businessRef.set({
//  example: business.yahooData
//});

/*
let db = admin.database();
let ref = db.ref("restricted_access/secret_document");
let businesssRef = ref.child("business");
var brandRef = ref.child("brands");

ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});
*/

/*
function recordBrand (brand) {
  brandRef.set({
    Google_brand: {
      brand_data: brand,
    },
  });
  return(brand);
  }
*/

/*
function recordBusiness (business) {
  console.log('recordBusiness function started');
  const name = business.yahooData.uid;
  businesssRef.set({
    name: {
      Yahoo_data: business.yahooData
    }
});
return (business);
}
*/

  /*let docRef = firestore.collection('brands').doc('Paris');

  let setAda = docRef.set({
    first: 'Ada',
    last: 'Lovelace',
    born: 1815
  });*/


//module.exports = recordBrand;
//module.exports = demoInitialize;
//module.exports = recordBrand;

    /*let docRef = firestore.collection('brands').doc('Paris');
    let setAda = docRef.set({
      first: 'Ada',
      last: 'Lovelace',
      born: 1815
    });*/