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
          $.each(result, function(i, business){
            $('#getResultDiv .list-group').append(JSON.stringify(business) + "<br>")
          });
        },
        error : function(e) {
          $("#getResultDiv").html("<strong>Error</strong>");
          console.log("ERROR: ", e);
        }
        });  
    }

             // LOAD REQUEST
             $("#loadButton").click(function(event){
              event.preventDefault();
              ajaxLoad();
            });
            
            // DO LOAD
            function ajaxLoad(){
              $.ajax({
                type : "GET",
                url : window.location + "api/businesses/all",
        
                success: function(result){
                  $('#getResultDiv ul').empty();
                  $("#getResultDiv").html("<p>" + 
                  "Info we found "+ JSON.stringify(result)); 
                    //append(businesses.business + "<br>")
            },
                error : function(e) {
                  $("#getResultDiv").html("<strong>Error</strong>");
                  console.log("ERROR: ", e);
                }
                });  
          }
});
