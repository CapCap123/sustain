//import {db} from './background.js';

async function findWebsiteName(currentURL) {
    try {
      var websiteName = "";
      const urlArray = currentURL.split('/');
      if (urlArray[0] == "http:" || urlArray[0] == "https:") {
      const name = urlArray[2];
      websiteName = await cleanName(name);
      return websiteName
      } else {
        const name = urlArray[0];
        const nameArray = name.split(':');
        let websiteName= nameArray[0];
        return websiteName
      }
    } catch(error) {
      console.log(error);
    }
  return websiteName
  }
  module.exports = { findWebsiteName };
  
  function cleanName2(website) {
    const websiteFullArray = website.split(".")
    const websiteArray = [websiteFullArray[0], websiteFullArray[1]]
    const urlEnds = ["fr","com","de","uk","pt","nl",'de','it','es','br','mx','il','ma','dk','co','au','ar','ca','ru','jp','za','kr','ng','dz','at','ch','se','tr']
  
    var websiteName = websiteArray.join('.');
  
     for (let i = 0; i < urlEnds.length ; i++) {
       if (websiteArray[1].includes(urlEnds[i])) {
         websiteName = websiteFullArray[0]
         return websiteName
       }
    }
    return websiteName
  }
  
  async function cleanName(name) {
    if (name.includes("www.") == true) {
      let website = name.replace("www.","");
      let website2 = await cleanName2(website);
      return website2
    } else {
      let website = name;
      let website2 = await cleanName2(website);
      return website2
    }
  }

  // firebase data