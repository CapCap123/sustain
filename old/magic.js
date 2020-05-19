// magic.js

//const request = require('request');

const express = require('express')
app = express();
router = express.Router();

const fs = require ('fs');
const path = require('path');

const jquery = require('jquery');
const popper = require('bootstrap');
const bootstrap = require('bootstrap');
/*
//var path = __dirname + '/views/';
 
router.use(function (req,res,next) {
  console.log("/" + req.method);
  next();
});
 
router.get("/",function(req,res){
  res.sendFile("page2.html");
});

app.use("/",router);

router.use(function (req,res,next) {
    console.log("/" + req.method);
    next();
  });


app.get('/',(req,res)=>{
    res.sendFile('index.html');
});


//listen localhost:3000
app.listen(3000);
*/


$(document).ready(function() {

    // process the form
    $('form').submit(function(event) {

        // get the form data
        // there are many ways to get this data using jQuery (you can use the class or id also)
        var formData = {
            'name'              : $('input[name=name]').val(),
        };

        // process the form
        $.ajax({
            type        : 'POST', // define the type of HTTP verb we want to use (POST for our form)
            url         : 'process.php', // the url where we want to POST
            data        : formData, // our data object
            dataType    : 'json', // what type of data do we expect back from the server
                        encode          : true
        })
            // using the done promise callback
            .done(function(data) {

                // log data to the console so we can see
                console.log(data); 

                // here we will handle errors and validation messages
                if ( ! data.success) {

                    // handle errors for name ---------------
                    if (data.errors.name) {
                        $('#name-group').addClass('has-error'); // add the error class to show red input
                        $('#name-group').append('<div class="help-block">' + data.errors.name + '</div>'); // add the actual error message under our input
                    }
            } else {

            // ALL GOOD! just show the success message!
            $('form').append('<div class="alert alert-success">' + data.message + '</div>');

            // usually after form submission, you'll want to redirect
            // window.location = '/thank-you'; // redirect a user to another page
            alert('success'); // for now we'll just alert the user

        }

    });

        // stop the form from submitting the normal way and refreshing the page
        event.preventDefault();
    });
});