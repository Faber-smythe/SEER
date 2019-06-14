import React from 'react';
import PropTypes from 'prop-types';

export default function MenuLink (props){
  const {classes, target, title, onMenuClick, dots} = props;
  
  return(
    <a
    href="#"
    className={"blur " + classes}
    onClick={(event) => onMenuClick(event, target)}
    >
      {title}{dots && <span className="blinking_dots">...</span>}
    </a>
  )
}

MenuLink.propTypes = {
  classes: PropTypes.string,
  target: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  onMenuClick: PropTypes.func.isRequired,
  dots: PropTypes.bool,
};
