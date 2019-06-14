// ================================================================
// CUSTOMIZE THE DEFAULT BROWSER CHECKBOXES
// ================================================================

// SET UP
import React from 'react';
import PropTypes from 'prop-types';


export default function CustomCheckboxes (){
  /*
  /* TOOL FUNCTIONS
  */
  // Insert a new html element next to another one
  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }
  // Wrap an html element inside a new one
  function wrap(wrapper_tag, target, classname='') {
    var el = document.createElement(wrapper_tag);
    if(classname.length!=0){
        el.classList.add(classname);
    }
    target.parentNode.insertBefore(el, target);
    el.appendChild(target);
  }

  /*
  /* GLOBAL INTERVAL : it looks for any checkbox and passes it through the customization process
  */
  var checkboxTracker = setInterval(function(){
      // Is there any ?
      if(document.querySelector("input[type='checkbox']")){
        Array.from($("input[type='checkbox']")).forEach(function(checkbox){
          // Are they already customized ?
          if(checkbox.dataset.customized){
            return
          }else{
            // Wrap it
            wrap('div', checkbox, 'checkbox_wrapper');
            // Insert our own checkbox on top of the old one (style lives in /public/CSS/main.css)
            var new_checkbox = document.createElement("span");
            new_checkbox.classList.add("checkmark");
            insertAfter(new_checkbox, checkbox);
            // Add listener to the new checkbox, and make it update the invisible old one
            $(new_checkbox).click(function(e){
                var box = $(this.parentNode).find("input[type='checkbox']");
                //it's important to toggle both attr and prop
                if(!(box.attr("checked")) || !(box.prop("checked"))){
                    box.attr("checked", true);
                    box.prop("checked", true);
                }else{
                    box.attr("checked", false);
                    box.prop("checked", false);
                }
                // This is important to trigger the onChange html listener. React needs it.
                $("input[type='checkbox']").trigger('change');
            })
            // job has been done on this checkbox
            checkbox.dataset.customized = true;
          }
        })
      }
  }, 100)
}
