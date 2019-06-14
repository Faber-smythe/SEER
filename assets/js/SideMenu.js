import React from 'react';
import PropTypes from 'prop-types';

import MenuLink from './MenuLink';

export default function SideMenu (props){
  const {onMenuClick, creatingItem} = props ;

  // Initialize
  var text_dots = false;
  // Is there an unfinished note ? (check for non-empty fields in the creation form)
  if(creatingItem.text.name.length || creatingItem.text.content.length){
    // activate notification next to the Menu link
    text_dots = true;
  }

  return(
    <nav id="right_panel">
      <img src="/images/menu_background.jpg" alt="picture frame"/>
      <img src="/images/frame_reflection.png" alt="glass reflections"/>
      <MenuLink
      classes="menu_link"
      title="library"
      target="library"
      onMenuClick={onMenuClick}
      />
      <MenuLink
      classes="menu_link menu_sublink"
      title="+ new notes"
      target="new_notes"
      onMenuClick={onMenuClick}
      dots={text_dots}
      />
      <hr/>
      <MenuLink
      classes="menu_link"
      title="album"
      target="album"
      onMenuClick={onMenuClick}
      />
      <MenuLink
      classes="menu_link menu_sublink"
      title="+ new image"
      target="new_image"
      onMenuClick={onMenuClick}
      />
    </nav>
  )
}

SideMenu.propTypes = {
  displayedMenu: PropTypes.string.isRequired,
  onMenuClick: PropTypes.func.isRequired,
  creatingItem: PropTypes.object,
};
