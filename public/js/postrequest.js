$( document ).ready(function() {
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
        
        success : function(brand) {
            $("#postResultDiv").html("<p>" + 
            "Scraping information for "+ JSON.stringify($("#brandname").val())); 
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