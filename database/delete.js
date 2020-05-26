const debug = require('debug')('firestore-snippets-node');

// [START firestore_deps]
const admin = require('firebase-admin');
// [END firestore_deps]

// Fetch the service account key JSON file contents
let serviceAccount = require("/Users/Capucine/Desktop/Platform/Code/Firebase/servicekey.json");

// We supress these logs when not in NODE_ENV=debug for cleaner Mocha output
let console = {log: debug};

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sustainability-4ae3a.firebaseio.com"
});

var firestore = admin.firestore()

function deleteBusiness() {
    let businessRef = firestore.collection('businesses');
    let businessQuery = businessRef.where('Brands', 'array-contains',  brandname);


}

function deleteQueryBatch(firestore, query, resolve, reject) {
    query.get()
      .then((snapshot) => {
        // When there are no documents left, we are done
        if (snapshot.size === 0) {
          return 0;
        }
  
        // Delete documents in a batch
        let batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
  
        return batch.commit().then(() => {
          return snapshot.size;
        });
      }).then((numDeleted) => {
        if (numDeleted === 0) {
          resolve();
          return;
        }
  
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, resolve, reject);
        });
      })
      .catch(reject);
  }