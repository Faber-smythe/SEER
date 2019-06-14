// ================================================================
// ALLOW THE PINBAR TO OVERFLOW AND SHIFT WHEN HOVERING ON THE ENDS
// ================================================================

document.addEventListener("DOMContentLoaded", function(event) {
  const $ = require('jquery');

  // Initialize
  let shift = 0;
  var hovered_right = false;
  var hovered_left = false;

  // Setting the direction for the interval
  $('#pin_bar_shift_right').hover(
    function () {
      hovered_right = true;
    },
    function () {
      hovered_right = false;
    }
  );
  $('#pin_bar_shift_left').hover(
    function () {
      hovered_left = true;
    },
    function () {
      hovered_left = false;
    }
  );

  // Couldn't find an other solution than a global setInterval to make the hover listener work
  var loop = window.setInterval(function () {
    // Must hide the hover input to make the little cross sign clickable
    if(shift >= 0){
      $('#pin_bar_shift_left').css('display', 'none');
    }else{
      $('#pin_bar_shift_left').css('display', 'flex');
    }
    //Queuing up the Tween animation to make the PinBar move to the left
    if(hovered_right && (Math.abs(shift) < ($('#pin_bar').width() - $('#pin_bar_wrapper').width())+5)) {
      TweenLite.to($('#pin_bar'), 0.5, {x: shift});
      shift -= 10;
    }
    //Queuing up the Tween animation to make the PinBar move to the right
    if(hovered_left && (shift <= 0)) {
      TweenLite.to($('#pin_bar'), 0.5, {x: shift});
      shift += 10;
    }
  }, 20);

})
