import db from './background.js';

  function saveBrand (brand) {
    let brandRef = db.collection('brands');
    let parent = brand.business_ref;
    console.log('brand to be added to db' + JSON.stringify(brand));
    if (!parent || parent == '') {
      let addBrand = brandRef.add({
        name: brand.name,
        small_business: 'new',
        websites: [brand.website],
      }).then(ref => {
        console.log('Added brand with ID: ', ref.id);
      });
      return addBrand;
    } else {
      let addBrand = brandRef.add({
        name: brand.name,
        small_business: 'new',
        business_name: brand.business_name,
        business_ref: brand.business_ref,
        websites: [brand.website],
      }).then(ref => {
        console.log('Added brand with ID: ', ref.id);
      });
      return addBrand;
    }
  }

  module.exports = { saveBrand };