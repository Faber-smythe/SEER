/* ------------------------
/* SET UP
/* ---------------------- */
import React from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import ContentEditable from 'react-contenteditable';

export default function DisplayItem (props){
  const {displayedItem,
    blur,
    onEditableChange,
    saving,
    onPinning,
    onDeleteItem
  } = props;

  if(displayedItem.type == 'text'){
    return(
      <Scrollbars className="scroll_content_wrapper">
        <div id="show_content" data-content="pin">

          <ContentEditable
            className={blur ? 'blured' : ''}
            html={displayedItem.name} // innerHTML of the editable div
            disabled={false}
            onChange={(event) => onEditableChange(event, displayedItem.type, displayedItem, 'name')}
            tagName='h2'
          />
          <hr />
          <ContentEditable
            html={displayedItem.content} // innerHTML of the editable div
            disabled={false}
            onChange={(event) => onEditableChange(event, displayedItem.type, displayedItem, 'content')}
            tagName='pre'
          />

          {/* fixed content in top right corner of the main display*/}
          <div id="content_topright">
            {/*// Is an API action processing ?*/}
            {saving && <p className="saving_sign">auto-save<span className="blinking_dots">...</span></p>}
            <label htmlFor="pin_input">Pinned</label>
            <input
            id="pin_input"
            type="checkbox"
            checked={displayedItem.pinned ? 'checked' : ''}
            title="pin this item"
            onChange={(event) => onPinning(displayedItem)}
            />
            <i title="delete this item" onClick={(event) => onDeleteItem(displayedItem.type, displayedItem.id)} className="material-icons delete_input">delete</i>
          </div>

        </div>
      </Scrollbars>
    )
  } //TODO if type == 'image' / NOT IMPLEMENTED YET
  else{return null}
}

DisplayItem.propTypes = {
  displayedItem: PropTypes.object,
  blur: PropTypes.bool.isRequired,
  onEditableChange: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  onPinning: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
};
