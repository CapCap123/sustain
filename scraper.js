const request = require('request');
const cheerio = require('cheerio');

function yahooScraper(brandname, brand, business) {
//find Yahoo Code
    const url = "https://finance.yahoo.com/lookup?s=";
    var fullurl = url + brandname;
    console.log(fullurl);

    request(fullurl,(err,res,html)=> {
        if(err){
            console.log("Error looking for Yahoo code");}
        else{

            console.log(res.statusCode);
            var $ = cheerio.load(html);
            var yahooName = $("td[data-reactid='58']").text().toString();

            if (!brand.business_ref) {
                var yahooCode = $("td[data-reactid='56']").text().toString();
                business.yahoo_uid = yahooCode;
                business.name = yahooName;
                brand.business_ref = yahooCode;
                brand.business_name = yahooName;
                console.log('no business ref, yahoo code: ' + yahooCode +'yahoo name: ' + yahooName);

            } else {
                yahooCode = brand.business_ref;
                business.yahoo_uid = brand.business_ref;
                if (!brand.business_name) {
                    brand.business_name = yahooName
                    business.name = yahooName;
                } else {
                    business.name = brand.business_name;
                    console.log('business name already exists for this brand');
                }
                console.log('business ref already exists for this brand: ' + yahooCode);
            }
            console.log('Yahoo code is: ' + yahooCode);
        

    // find yahoo URLs
        const urlBusiness = "https://finance.yahoo.com/quote/"
        const urlSustain = "/sustainability"
        const urlProfiledata = "/profile"
        var urlEsg = urlBusiness + yahooCode + urlSustain
        var urlProfile = urlBusiness + yahooCode + urlProfiledata
    
        console.log(urlEsg, urlProfile);

        //scrap esg data 
        request(urlEsg,(err,res,html) => {
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
        request(urlProfile,(err,res,html) => {
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
            console.log('scraper business data: ' + JSON.stringify(business));   
            return business;  
        });
        }
        return business;    
    });
}

module.exports = yahooScraper;