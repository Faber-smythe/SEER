/* ------------------------
/* SET UP
/* ---------------------- */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

const $ = require('jquery');

import PinTab from './PinTab';
require('./OutsideScripts/PinBarShift');

export default function PinBar (props){
  const {pinnedItems,
    onTabClick,
    blur,
    handleBlur,
    loading,
    onPinning,
    sound,
    toggleSound,
  } = props;

  // Building the const outside of return() because you can't use incremental i++ with map()
  const text_tabs = [];
  for(var i=0;i<pinnedItems[0].length;i++){
    text_tabs.push(
      <PinTab
      key = {pinnedItems[0][i].id}
      item = {pinnedItems[0][i]}
      index={i + 1}
      onTabClick = {onTabClick}
      blur = {blur}
      onPinning = {onPinning}
      />
    )
  }
  return(
    <div id="pinning_menu">
      <div id="desk_cover_container">
        <div id="pin_bar_container">
          {/* Is an API action processing ? */}
          {loading && <p className="loading_sign">Loading<span className="blinking_dots">...</span></p>}
            <i id="pin_bar_shift_left" className="material-icons">
              arrow_back_ios
            </i>
            <div id="pin_bar_wrapper">
              <nav
              id="pin_bar"
              >
                {/* USE THE CONST BUILT BEFORE */}
                { text_tabs }
              </nav>
            </div>
            <i id="pin_bar_shift_right" className="material-icons">
              arrow_forward_ios
            </i>
        </div>
        {/* Pure graphic */}
        <div id="desk_cover"></div>
      </div>
      <div id="blur_input" onClick={(event) => handleBlur(event)}>
        <i
        className={blur ? "material-icons unblur" : "material-icons"}
        title={blur ? "unblur (right CTRL key)" : "blur (right CTRL key)"}
        >
          blur_on
        </i>
      </div>
      <div id="sound_input" title={sound ? "sound off" : "sound on"} onClick={(event) => toggleSound(event)} className={sound ? '' : 'sound_off'}>
        <span>
        </span>
      </div>
    </div>
  )
}

PinBar.propTypes = {
  pinnedItems: PropTypes.array.isRequired,
  onTabClick: PropTypes.func.isRequired,
  blur: PropTypes.bool.isRequired,
  handleBlur: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  onPinning: PropTypes.func.isRequired,
  toggleSound: PropTypes.func.isRequired,
  sound: PropTypes.bool.isRequired,
};
