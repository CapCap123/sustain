$( document ).ready(function() {
  document.getElementById("loadButton").style.display = "none";
  document.getElementById("allBusinesses").style.display = "none";
  var number = 0;

    // SUBMIT FORM
      $("#businessForm").submit(function(event) {
      // Prevent the form from submitting via the browser.
      event.preventDefault();
      ajaxPost();
      resetData();
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
        async: true,

        success : function(results) {
          document.getElementById("postResultDiv").style.display = "inline"
          document.getElementById("loadButton").style.display = "none"
          document.getElementById("getResultDiv").style.display = "none"
          document.getElementById("getResultsDiv").style.display = "none"
          console.log(results)
          if(results.hasBusiness_ref == false) {
            $("#postResultDiv").html("<p>" + 
              "We did not find official information about "+ results.name + "<p>");   
          } else {
            if (results.hasEsg == false) {
              $("#postResultDiv").html("<p>" + 
              results.name + " belongs to "+ results.business_name + 
              "<p>" + results.business_name + " did not make their information public");
            } else {
              $("#postResultDiv").html("<p>" + results.name + " belongs to " + results.business_name +
              "<p>Here is what we found about " + results.business_name + 
              ":<p>- ESG risk score: "+ results.yahoo_esg + "% (" + results.yahoo_percentile +
              ")<p>- Environmental risk: "+ results.yahoo_envrisk); 
            }
          }
        },
        error : function(e) {
          alert("Error!")
          console.log("ERROR: ", e);
        }
        });

      resetData();
      function resetData(){
        $("#businessname").val("");
      }
    };
    resetData();
    function resetData(){
      $("#businessname").val("");
    }
  })