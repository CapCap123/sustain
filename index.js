const request = require('request');
const cheerio = require('cheerio');
const express = require('express')
app = express();
const fs = require ('fs');
const path = require('path');

const url = "https://finance.yahoo.com/quote/FB/sustainability"

//hide my files
app.use('/public',express.static(path.join(__dirname,'static')));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'static','page.html'));
});

app.listen(3000);

//scraper(url,statsCode)
request(url,(err,res,html)=> 
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

    const esgData = [yahooName, esg, percentile, controverse, envrisk, url];
    console.log(esgData);

    fs.appendFile('esgdata.txt', '\n' + esgData ,(err)=>{
        if(err)
            console.log(err);
        else
            console.log(+ yahooName + ' added to esgdata file');
    })
    
}
});