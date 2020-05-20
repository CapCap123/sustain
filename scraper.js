const request = require('request');
const cheerio = require('cheerio');

function scraper(brandname, business) {
    const url = "https://finance.yahoo.com/lookup?s=";

    var fullurl = url + brandname;
    console.log(fullurl);

    request(fullurl,(err,res,html)=> {

    if(err){
        console.log("Error looking for Yahoo code");}
    else{
        console.log(res.statusCode);

        var $ = cheerio.load(html);

            // find Yahoo code on search url
            var yahooCode = $("td[data-reactid='56']").text().toString();
            var yahooName = $("td[data-reactid='58']").text().toString();

            business.businessName = yahooName;

            console.log(JSON.stringify(
                brandname + 
                ' has been identified as '+ 
                yahooName + 
                ' on Yahoo, code: ' + 
                yahooCode));

            // find esg data url
            const urlBusiness = "https://finance.yahoo.com/quote/"
            const urlSustain = "/sustainability"
            var urlEsg = urlBusiness + yahooCode + urlSustain
            console.log(urlEsg);

            //scrap esg data 
            request(urlEsg,(err,res,html) => {
            if(err){console.log("Error");}
            else {
                console.log(res.statusCode);

                var $ = cheerio.load(html);

                var esg = $("div[data-reactid='20']").text().toString();
                var percentile = $("span[data-reactid='22']").find("span[data-reactid='23']").text().toString();
                var envrisk = $("div[data-reactid='31']").find("div[data-reactid='35']").text().toString();
                var controverse = $("div[data-reactid='79']").text().toString();

                //store data
                const esgData = {'Yahoo ID': yahooCode, 'ESG risk score': esg, 'ESG percentile': percentile, 'Controversy level': controverse, 'Environmental risk': envrisk, 'Sustain data url': urlEsg};
                business.yahooData = esgData;
                
                console.log('last request loop' + JSON.stringify(business));   
                return(business);         
                }    
            })
        } 
        }) 
    };

    module.exports = scraper;