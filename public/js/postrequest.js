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
          businessname : $("#businessname").val(),
        };

        // DO POST
        $.ajax({
        type : "POST",
        contentType : "application/json",
        url : "api/businesses/save",
        data : JSON.stringify(formData),
        dataType : 'json',
        
        success : function(business) {
            $("#postResultDiv").html("<p>" + 
            "Scraping information for "+ business.brandname); 
        },

        error : function(e) {
          alert("Error!")
          console.log("ERROR: ", e);
        }
      });
        
        // Reset FormData after Posting
        resetData();
      };

      /*
      $("data ready") {
        // Prevent the form from submitting via the browser.
        event.preventDefault();
        ajaxData();
      };

      function ajaxData() {
        
        // PREPARE FORM DATA
        var formData = {
          businessname : $("#businessname").val(),
        };

        // DO POST
        $.ajaxData({
        type : "POST",
        contentType : "application/json",
        url : "./app.js",
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
      })
      */
        
        // Reset FormData after Posting
        resetData();
      
      function resetData(){
        $("#businessname").val("");
      }
  })