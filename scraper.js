const request = require('request');
const cheerio = require('cheerio');
// use axios instead of request

async function yahooCodeScraper(brand) {
    try {
//find Yahoo Code
    var brandname = brand.name
    const url = "https://finance.yahoo.com/lookup?s=";
    var fullurl = url + brandname;
    console.log(fullurl);

    yahooCode = await request(fullurl,(err,res,html)=> {
        if(err){
            console.log("Error looking for Yahoo code");}
        else{
            console.log(res.statusCode);
            var $ = cheerio.load(html);
            var yahooName = $("td[data-reactid='58']").text().toString();
            var yahoo_uid = $("td[data-reactid='56']").text().toString();
            brand.business_ref = yahoo_uid;
            brand.business_name = yahooName;
            console.log('SCRAPER - yahoo code: ' + yahoo_uid + 'yahoo name: ' + yahooName);
        }
     yahoo_uid
    })
    } catch(error) {
        console.log(error)
    }
    console.log(yahooCode)
    return yahooCode
}
        
async function yahooDataScraper(business) {
    try {
        yahooCode = business.business_ref
        business.yahoo_uid = yahooCode
    // find yahoo URLs
        const urlBusiness = "https://finance.yahoo.com/quote/"
        const urlSustain = "/sustainability"
        const urlProfiledata = "/profile"
        var urlEsg = urlBusiness + yahooCode + urlSustain
        var urlProfile = urlBusiness + yahooCode + urlProfiledata
    
        console.log(urlEsg, urlProfile);

        //scrap esg data 
        await request(urlEsg,(err,res,html) => {
            if(err){console.log("Error");}
            else {
                console.log(res.statusCode);
                var $ = cheerio.load(html);

                var esg = $("div[data-reactid='20']").text().toString();
                var percentile = $("span[data-reactid='22']").find("span[data-reactid='23']").text().toString();
                var envrisk = $("div[data-reactid='34']").find("div[data-reactid='35']").text().toString();
                var controverse = $("div[data-reactid='79']").text().toString();

                //store esg data
                business.yahoo_esg = esg;
                business.yahoo_percentile = percentile;                
                business.yahoo_controverse = controverse;
                business.yahoo_envrisk = envrisk;
                business.small_business = "new"
            }   

        return business;  
        });

        //scrap profile data 
        await request(urlProfile,(err,res,html) => {
            if(err){console.log("Error");}
            else {
                console.log(res.statusCode);
                var $ = cheerio.load(html);
        
                var employees = $("p[data-reactid='18']").find("span[data-reactid='30']").text().toString();
                var sector = $("p[data-reactid='18']").find("span[data-reactid='21']").text().toString();
                var industry = $("p[data-reactid='18']").find("span[data-reactid='25']").text().toString();
        
                //store esg data
                business.employees = employees;
                business.sector = sector;
                business.industry = industry;
            } 
        return business;
        })
    } catch(error) {
        console.log(error)
    }
        console.log('scraper business data: ' + JSON.stringify(business));   
        return business;  
        }


module.exports = {yahooCodeScraper, yahooDataScraper};