function checkBrand (brandname) {
    quickstartQuery(firestore);
    return(brandname)
  }
  
  function quickstartQuery(firestore) {
    let brandQuery = firestore.collection('brands').where('Brands', 'array-contains',  brandname);
    let brandQueryResults = brandQuery.get();
    if (brandQueryResults.empty) {
      console.log('empty query');
    } 
    else {
    let brandQuerySnapshots = function(snapshot) => {
        snapshot.forEach(doc => {
          console.log(doc.id, '=>', doc.data());
          if (doc.id == null) {
          getData(brandname,business);
          } else {
          firestore.collection('businesses').where('yahoo_uid', '=',  doc.id)
            .get()
            .then(snapshot => {
              snapshot.forEach(doc => {
                console.log(doc.id, '=>', doc.data());
                business = doc.data(doc.id);
                console.log('retrieved data: ' + JSON.stringify(business));
                getData(brandname,business);
                });
              }) 
            .catch(err => {
              console.log('Error getting documents', err);
            });
          }
          });
        })
      }
      brandQuery.catch(err => {
        console.log('Error getting documents', err);
      });
    }