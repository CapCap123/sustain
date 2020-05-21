var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require("/Users/Capucine/Desktop/Platform/Code/Firebase/servicekey.json");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sustainability-4ae3a.firebaseio.com"
});

var db = admin.database();
var ref = db.ref("restricted_access/secret_document");

var businesssRef = ref.child("business");
var brandRef = ref.child("brands");

ref.once("value", function(snapshot) {
  console.log(snapshot.val());
});

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

function recordBusiness (business) {
  console.log('recordBusiness function started');
  businesssRef.set({
    Google_business: {
      Yahoo_data: business.yahooData,
    },
});
return (business);
}

module.exports = recordBusiness;
//module.exports = recordBrand;