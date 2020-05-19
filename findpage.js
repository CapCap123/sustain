const request = require('request');
const cheerio = require('cheerio');
const fs = require ('fs');

function scraper(reqname, business) {
    const url = "https://finance.yahoo.com/lookup?s=";

    //var allBusinesses = {};
    //var business = {};

    var fullurl = url + reqname;
    console.log(fullurl);

    request(fullurl,(err,res,html)=> {

    if(err){
        console.log("Error looking for Yahoo code");}
    else{
        console.log(res.statusCode);
        //business.name = reqname;

        var $ = cheerio.load(html);

            // find Yahoo code
            var scrapedCode = $("td[data-reactid='56']").text().toString();

            business.yahooCode = scrapedCode;

            console.log(JSON.stringify(business));

            // find esg data url
            const urlBusiness = "https://finance.yahoo.com/quote/"
            const urlSustain = "/sustainability"
            var urlEsg = urlBusiness + business.yahooCode + urlSustain
            console.log(urlEsg);

            //scrap esg data
            request(urlEsg,(err,res,html)=> 
            {
            if(err){console.log("Error");}
            else{
                console.log(res.statusCode);

                var $ = cheerio.load(html);

                var yahooName = $("h1[data-reactid='7']").text().toString();
                var esg = $("div[data-reactid='20']").text().toString();
                var percentile = $("span[data-reactid='22']").find("span[data-reactid='23']").text().toString();
                var envrisk = $("div[data-reactid='31']").find("div[data-reactid='35']").text().toString();
                var controverse = $("div[data-reactid='79']").text().toString();

                const esgData = {'Yahooname': yahooName, 'ESG risk score': esg, 'ESG percentile': percentile, 'Controversy level': controverse, 'Environmental risk': envrisk, 'Sustain data url': urlEsg};
                console.log(esgData);

                business.yahooData = esgData;

                console.log(JSON.stringify(business));
            }
            });
        
        }
        });
    };

    module.exports = scraper;

    //scraper('facebook');

            /*
            fs.appendFile('esgdata.txt', '\n' + esgData ,(err)=>{
                if(err)
                    console.log(err);
                else
                    console.log(yahooName + ' added to esgdata file');
            })

               if(err) {
        console.log("Error in scraper function");
    }
    else { 
            */