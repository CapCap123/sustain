$( document ).ready(function() {
  
    // GET REQUEST
    $("#allBusinesses").click(function(event){
      event.preventDefault();
      ajaxGet();
    });
    
    // DO GET
    function ajaxGet(){
      $.ajax({
        type : "GET",
        url : window.location + "api/businesses/all",
        success: function(result){
          $('#getResultDiv ul').empty();
          var custList = "";
          $.each(result, function(i, business){
            $('#getResultDiv .list-group').append(JSON.stringify(business) + "<br>")
            //append(businesses.business + "<br>")
          });
          console.log("Success: ", result);
        },
        error : function(e) {
          $("#getResultDiv").html("<strong>Error</strong>");
          console.log("ERROR: ", e);
        }
      });  
    }
  })