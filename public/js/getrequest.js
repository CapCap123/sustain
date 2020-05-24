$( document ).ready(function() {
  
    // GET REQUEST
    $("#allBusinesses").click(function(event){
      event.preventDefault();
      ajaxGet();
      console.log('ajaxGet called')
    });
    
    // DO GET
    function ajaxGet(){
      $.ajax({
        type : "GET",
        url : window.location + "api/businesses/all",

        success: function(result){
          document.getElementById("getResultsDiv").style.display = "inline"
          $('#getResultsDiv ul').empty();
          $.each(result, function(i, business){
            $('#getResultsDiv .list-group').append(JSON.stringify(business) + "<br>")
          });
        },
        error : function(e) {
          $("#getResultsDiv").html("<strong>Error</strong>");
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
        
        success: function(businesses){
          $('#getResultDiv').empty();
          document.getElementById("getResultDiv").style.display = "inline";
          var yourBusiness = businesses[businesses.length - 1];

          if(!yourBusiness.yahoo_uid) {
          $("#getResultDiv").html("<p>" + 
            "We did not find official information about "+ yourBusiness.name + "<p>");   
          } else {
            if (yourBusiness.yahoo_esg == "") {
              $("#getResultDiv").html("<p>" + 
              yourBusiness.brandname + " belongs to "+ yourBusiness.name + 
              "<p>" + yourBusiness.name + " did not make their information public");
            } else {
            $("#getResultDiv").html("<p>" + yourBusiness.brandname + " belongs to " + yourBusiness.name +
            "<p>Here is what we found about " + yourBusiness.name + 
            ":<p>- ESG risk score: "+ yourBusiness.yahoo_esg + "% (" + yourBusiness.yahoo_percentile +
            ")<p>- Environmental risk: "+ yourBusiness.yahoo_envrisk); 
            }
          }
        },

        error : function(e) {
          $("#getResultDiv").html("<strong>Error</strong>");
          console.log("ERROR: ", e);
        }
      });  
    }
});
