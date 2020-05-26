$( document ).ready(function() {
  document.getElementById("loadButton").style.display = "none";
  document.getElementById("allBusinesses").style.display = "none";
  var number = 0;

    // SUBMIT FORM
      $("#businessForm").submit(function(event) {
      // Prevent the form from submitting via the browser.
      event.preventDefault();
      ajaxPost();
    });
      
      function ajaxPost(){
        
        // PREPARE FORM DATA
        var formData = {
          brandname : $("#brandname").val(),
        };

        // DO POST
        $.ajax({
        type : "POST",
        contentType : "application/json",
        url : "api/businesses/save",
        data : JSON.stringify(formData),
        dataType : 'json',
        async: false,

        success : function(business) {
        //document.getElementById("postResultDiv").style.display = "inline"
        document.getElementById("loadButton").style.display = "none"
        document.getElementById("getResultDiv").style.display = "none"
        document.getElementById("getResultsDiv").style.display = "none"
        number++;
        if (number > 1) {
          document.getElementById("allBusinesses").style.display = "block";
        } else {
          document.getElementById("allBusinesses").style.display = "none";
        }

          if (!business.yahoo_uid) {
            console.log(JSON.stringify(business));
            setTimeout(displayButton, 5000);

            $("#postResultDiv").html("<p>" + 
            "Scraping information for "+ JSON.stringify($("#brandname").val())); 

            function displayButton(number) {
              $("#postResultDiv").html("<p>" + "Data ready"); 
              document.getElementById("loadButton").style.display = "block";
            }

          } else {
            console.log(JSON.stringify(business));
            $("#postResultDiv").html("<p>" + 
            "information for "+ JSON.stringify(business)); 
          }
        }, 

        error : function(e) {
          alert("Error!")
          console.log("ERROR: ", e);
        }
      });
        
        // Reset FormData after Posting
        resetData();
      };
      
      function resetData(){
        $("#businessname").val("");
      }
  })