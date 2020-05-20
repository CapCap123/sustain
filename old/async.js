var async = require("async");
var fs = require('fs');

//scraper = require('./scraper');
 
var obj = {dev: "/dev.json", test: "/test.json", prod: "/prod.json"};
var configs = {};

async.forEachOf(obj, (value, key, callback) => {
    fs.readFile(__dirname + value, "utf8", (err, data) => {
        if (err) return callback(err);
        try {
            configs[key] = JSON.parse(data);
        } catch (e) {
            return callback(e);
        }
        callback();
    });
}, err => {
    if (err) console.error(err.message);
    // configs is now a map of JSON data
    doSomethingWith(configs);
});

/*
const brandname = "google";
var business = {};
var reqname = business.brandname;

    const scraperAsync = () => {
        return new Promise((resolve) => {
          scraper((reqname,business) => resolve('scraping over'))
        })
      }
    
      const scraper = async () => {
        console.log(await scraperAsync())
      };

      console.log('Before')
      scraper()
      console.log('After')

    const doSomethingAsync = () => {
        return new Promise((resolve) => {
        setTimeout(() => resolve('I did something'), 3000)
        })
    }
    const doSomething = async () => {
        console.log(await doSomethingAsync())
    };
    
    console.log('Before')
    doSomething()
    console.log('After')
  */
    
      