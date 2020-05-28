const axios = require ('axios');
const cheerio = require('cheerio');


//Code Scraper
async function urlScraper(brand) {
    try {
    console.log('urlScraper started')
        var brandname = brand.name
        const url = "https://finance.yahoo.com/lookup?s=";
        var fullUrl = url + brandname;
        console.log(fullUrl);

        var html = await axios.get(fullUrl)
        var $ = await cheerio.load(html.data)
    } catch(error) {
        console.log(error);
    }
    return $
}

async function yahooCodeScraper(brand) {
    try {
        let $ = await urlScraper(brand)
        console.log('yahooCodeScraper started')
        var yahooName = $("td[data-reactid='58']").text().toString();
        var yahoo_uid = $("td[data-reactid='56']").text().toString();

        brand.business_ref = yahoo_uid;
        brand.business_name = yahooName;                
        console.log('SCRAPER - yahoo code: ' + yahoo_uid + ' - yahoo name: ' + yahooName);
    } catch(error) {
        console.log(error)
    }
    return yahoo_uid
}

// esg data scraper
async function urlEsgScraper(yahooCode) {
    try {
        console.log('url esg data Scraper started')

    // find yahoo URLs
        const urlBusiness = "https://finance.yahoo.com/quote/"
        const urlSustain = "/sustainability"

        var urlEsg = urlBusiness + yahooCode + urlSustain
        console.log(urlEsg);

        var htmlEsg = await axios.get(urlEsg)
        var $ = await cheerio.load(htmlEsg.data)

    } catch(error) {
        console.log(error);
    }
    return $
}

async function urlProfileScraper(yahooCode) {
    try {
        console.log('url profile data Scraper started')
    // find yahoo URLs
        const urlBusiness = "https://finance.yahoo.com/quote/"
        const urlProfiledata = "/profile"
        var urlProfile = urlBusiness + yahooCode + urlProfiledata
    
        console.log(urlProfile);

        var htmlProfile = await axios.get(urlProfile)
        var $ = await cheerio.load(htmlProfile.data)

    } catch(error) {
        console.log(error);
    }
    return $
}

async function yahooEsgScraper(business) {
    try {
        let yahooCode = business.business_ref
        let $ = await urlEsgScraper(yahooCode)

        var esg = $("div[data-reactid='20']").text().toString();
        var percentile = $("span[data-reactid='22']").find("span[data-reactid='23']").text().toString();
        var envrisk = $("div[data-reactid='34']").find("div[data-reactid='35']").text().toString();
        var controverse = $("div[data-reactid='79']").text().toString();

        //store esg data
        business.yahoo_esg = esg;
        business.yahoo_percentile = percentile;                
        business.yahoo_controverse = controverse;
        business.yahoo_envrisk = envrisk;

        if (esg.length < 1) {
            business.hasEsg = false 
        } else {
            business.hasEsg = true
        }
    } catch(error) {
        console.log(error)
    }
    return business
}

async function yahooProfileScraper(business) {
    try {
        //let updatedBusiness = await(yahooEsgScraper(business))
        let yahooCode = business.business_ref
        let $ = await urlProfileScraper(business.business_ref)

        var employees = $("p[data-reactid='18']").find("span[data-reactid='30']").text().toString();
        var sector = $("p[data-reactid='18']").find("span[data-reactid='21']").text().toString();
        var industry = $("p[data-reactid='18']").find("span[data-reactid='25']").text().toString();
        
        //store profile data
        business.employees = employees;
        business.sector = sector;
        business.industry = industry;

    } catch(error) {
        console.log(error)
    }
    console.log('scraper business data: ' + JSON.stringify(business));   
    return business;  
        }

async function yahooScraper(business) {
    try{
        updatedBusiness = await((yahooEsgScraper(business)))
        businessProfile = await((yahooProfileScraper(business)))

        updatedBusiness.employees = await businessProfile.employees;
        updatedBusiness.sector = await businessProfile.sector;
        updatedBusiness.industry = await businessProfile.industry;
    } catch(error){
        console.log(error)
    }
    return updatedBusiness;
}

module.exports = {yahooScraper, yahooCodeScraper};