//import * as admin from 'firebase-admin';
//const { app } = require ('./firebaseConfig');


//firestore = admin.firestore()

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