function checkBrand (brandname) {
  quickstartQuery(brandname);
  console.log('looking into db');
  return(brandname)
}

function quickstartQuery(firestore) {
  // [START quickstart_query]
  // Realtime listens are not yet supported in the Node.js SDK

  businessRef.where('Facebook', 'in',  'Scraper')
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch(err => {
      console.log('Error getting data', err);
    });
  }


let done = true


const loadData = new Promise(
(resolve, reject) => {
if (done) {
const workDone = 'Here is the thing I built'
resolve(workDone)
} else {
const why = 'Still working on something else'
reject(why)
}
}
)

const xhr = new XMLHttpRequest()
xhr.onreadystatechange = () => {
if (xhr.readyState === 4) {
xhr.status === 200 ? console.log(xhr.responseText) : console.error('error')
}
}
xhr.open('GET', 'https://yoursite.com')
xhr.send()


//var async = require("async");

//var events = require('events');
//const eventEmitter = require('events').EventEmitter()
//const myEmitter = eventEmitter();

//const EventEmitter = require('events');
//class MyEmitter extends EventEmitter {}
//const myEmitter = new MyEmitter();


var events = require('events');
var eventEmitter = new events.EventEmitter();

eventEmitter.on('esg data ready', () => {
    console.log('event listening')
  });

eventEmitter.emit('data ready') //make in a dedicated .js?
function newFunction() {
    return require('events').EventEmitter();
  }

/*

const postEsgData = async () => {
  var business = {};
  business.brandname = req.body.businessname;
  //const response = await scraper('/findpage.js') // get users list
  const esgData = await scraper(business.brandname,business) // parse JSON
  //const user = users[0] // pick first user
  const userResponse = await esgData
  var userData =

  const userData = await user.json() // parse JSON
  return userData
  }

  postEsgData()

  */
   