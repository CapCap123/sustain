$( document ).ready(function() {
  console.log('file post called');
  
    // SUBMIT FORM
      $("#customerForm").submit(function(event) {
      // Prevent the form from submitting via the browser.
      event.preventDefault();
      ajaxPost();
      console.log('form submission');
    });
      
      
      function ajaxPost(){
        
        // PREPARE FORM DATA
        var formData = {
          firstname : $("#firstname").val(),
          lastname :  $("#lastname").val()
        };

        console.log('data ready')
        // DO POST
        $.ajax({
        type : "POST",
        contentType : "application/json",
        url : window.location + "api/customers/save",
        data : JSON.stringify(formData),
        dataType : 'json',
        success : function(customer) {
          $("#postResultDiv").html("<p>" + 
            "Post Successfully! <br>" +
            "--->" + JSON.stringify(customer)+ "</p>"); 
            console.log(data);
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
        $("#firstname").val("");
        $("#lastname").val("");
      }
  })