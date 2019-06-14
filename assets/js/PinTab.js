import React from 'react';
import PropTypes from 'prop-types';

export default function PinTab (props){
  const {item, onTabClick, blur, index, onPinning} = props;
  return(
    <div
    className='pin_tab'
    title={item.name}
    onClick = {(event) => onTabClick(event, item)}
    style={{background: "url('/images/paper_tab3.png') no-repeat", backgroundSize: "cover", backgroundPosition: 'top left', zIndex: index}}
    >
      <p
      className={blur ? 'blured' : ''}
      >
        {item.name}
      </p>
      <span className="tab_pin_sign" title="unpin this item" onClick={(event) => onPinning(item)}>
        {/* unicode for CROSS sign */}
        &#9587;
      </span>
    </div>
  )
}

PinTab.propTypes = {
  item: PropTypes.object.isRequired,
  onTabClick: PropTypes.func.isRequired,
  blur: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  onPinning: PropTypes.func.isRequired,
};
