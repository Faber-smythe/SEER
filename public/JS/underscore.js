$(document).ready(function($){

  $('#underscore').css('opacity', '0');
  var visible = false;
  setInterval(function(){
    if(visible){
      $('#underscore').css('opacity', '0');
      visible = false;
    }else{
      $('#underscore').css('opacity', '1');
      visible = true;
    }
  }, 800);

})
