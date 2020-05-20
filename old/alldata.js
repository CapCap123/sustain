$( document ).ready(function() {
      ('data ready').submit(function(event) {
      // Prevent the form from submitting via the browser.
      event.preventDefault();
      ajaxData();
    });
      
      
      function ajaxData(){
        
        // PREPARE FORM DATA
        var formData = {
          businessname : $("#businessname").val(),
        };

        // DO POST
        $.ajax({
        type : "POST",
        contentType : "application/json",
        url : "../app.js",
        data : JSON.stringify(formData),
        dataType : 'json',
        
        success : function(business) {
            $("#postResultDiv").html("<p>" + 
            "Scraping information for "+ JSON.stringify(business)); 
        },

        error : function(e) {
          alert("Error!")
          console.log("ERROR: ", e);
        }
      });
        
        // Reset FormData after Posting
        resetData();
      }
      
      function resetData(){
        $("#businessname").val("");
      }
  })