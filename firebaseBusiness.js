const admin = require('firebase-admin');
var firestore = admin.firestore()

let businessRef = firestore.collection('businesses');

function recordBusiness (business) {
  if(!business.yahoo_uid) {
  console.log('no business to be added to db');
  } else {
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
}

module.exports = recordBusiness;