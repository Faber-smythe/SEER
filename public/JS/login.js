document.addEventListener("DOMContentLoaded", function(event) {

  function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  function wrap(wrapper_tag, target, classname='') {
    var el = document.createElement(wrapper_tag);
    if(classname.length!=0){
        el.classList.add(classname);
    }
    target.parentNode.insertBefore(el, target);
    el.appendChild(target);
  }
  setInterval(function(){
      if(document.querySelector("input[type='checkbox']")){
        Array.from($("input[type='checkbox']")).forEach(function(checkbox){
          if(checkbox.dataset.customized){
            return
          }else{

            wrap('div', checkbox, 'checkbox_wrapper');
            var new_checkbox = document.createElement("span");
            new_checkbox.classList.add("checkmark");
            insertAfter(new_checkbox, checkbox);

            $(new_checkbox).click(function(e){
                var box = $(this.parentNode).find("input[type='checkbox']");
                if(!(box.attr("checked")) || !(box.prop("checked"))){
                    box.attr("checked", true);
                    box.prop("checked", true);
                }else{
                    box.attr("checked", false);
                    box.prop("checked", false);
                }
                $("input[type='checkbox']").trigger('change');
            })

            checkbox.dataset.customized = true;
          }
        })
      }
  }, 100)

})
