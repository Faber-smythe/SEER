/* TODO
/* THIS COMPONENT RENDERS FOUR DIFFERENT WAYS. IT NEEDS TO BE SPLIT IN FOUR DIFFERENT COMPONENTS :
/* - Library
/* - NewNotes
/* - Album
/* - NewImage
*/

// ========================================
// SET UP
// ========================================
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import slugify from 'react-slugify';


export default class DisplayMenu extends Component{
  // ========================================
  // CONSTRUCT
  // ========================================
  constructor(props){
    super(props);
    this.state={
      searchedTexts: null,
    }
    // BINDING THE METHODS TO USE -$THIS- INSIDE
    this.handleSearch = this.handleSearch.bind(this);

    // React refs for HTML elements
    this.title = React.createRef();
    this.text = React.createRef();
    this.pinned = React.createRef();
    this.searchBar = React.createRef();
  }

  // A new note wants to be saved - called in displayedMenu == 'new_notes' with onSubmit
  handleNewTextSubmit(event){
    event.preventDefault();
    const {metaInfo, addNewText} = this.props;
    const newText = {
      user: metaInfo.userId,
      world: metaInfo.worldId,
      game: metaInfo.gameId,
      name: this.title.current.value,
      content: this.text.current.value,
      pinned: this.pinned.current.checked,
      slug: slugify(this.title.current.value),
      type: 'text',
    }
    // lives in SightApp
    addNewText(newText);
  }

  // Searchbar is being used - called in DisplayMenu[library] with onChange
  handleSearch(event, displayedMenu){
    //initialize
    var results = [];
    // is there an input ?
    if(this.searchBar.current.value != ''){
      var regex = new RegExp(this.searchBar.current.value, 'i');
      // the above i flag is to ignore case-sensitivity
      if(displayedMenu == 'library'){
        this.props.textItems.forEach((text) => {
          if((text.name).match(regex)){
            results.push(text);
          }
        })
        if(results.length > 0){
          this.setState({searchedTexts: results});
        }else{
          this.setState({searchedTexts: null})
        }
      }
    }//TODO if displayedMenu == 'album' / NOT IMPLEMENTED YET
    else{
      this.setState({searchedTexts: null})
    }
  }

  // ========================================
  // NOW RENDERING
  // ========================================
  render(){
    const {
      displayedMenu,
      blur,
      onOpeningItem,
      onPinning,
      onDeleteItem,
      saving,
      deleting,
      creatingItem,
      watchItemCreation,
      clearForm,
    } = this.props;

    const {searchedTexts} = this.state;
    var textList;

    if(searchedTexts){
      textList = searchedTexts;
    }else{
      textList = this.props.textItems;
    }
    var onGoing = false;
    if(creatingItem.text.name.length || creatingItem.text.content.length){
      onGoing = true;
    }
    return(
      <Scrollbars className="scroll_content_wrapper">
        {/* ----------------------------
        // #LIBRARY DISPLAY
        // ----------------------------*/}
        {displayedMenu == 'library' &&
          <div id="show_content" data-content="menu">
            <h2>
              LIBRARY<span id="underscore">_</span>
            </h2>
            <hr />
            <input id="searchbar" ref={this.searchBar} onChange={(event) => this.handleSearch(event, displayedMenu)} placeholder="search..." type="text"/>
            <table>
                <thead>
                  <tr>
                    <th>Pinned</th>
                    <th></th>
                    <th>
                    {this.searchBar.current && this.searchBar.current.value && !searchedTexts && 'No item found'}
                    {searchedTexts && 'Found '+searchedTexts.length+' items'}
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {textList.map(text => (
                    <tr
                    key={text.id}
                    title={text.name}
                    >
                      <td className='checkbox_td'>
                        <input
                        title="pin this item"
                        checked={text.pinned ? 'checked' : ''}
                        type="checkbox"
                        onChange={(event) => onPinning(text)}
                        />
                      </td>
                      <td
                      style={{fontFamily:'printed'}}
                      onClick={(event) => onOpeningItem(text)}
                      className={blur ? 'blured' : ''}>
                        <p className="title_excerpt">{text.name}</p>
                      </td>
                      <td
                      className={blur ? 'blured' : ''}
                      onClick={(event) => onOpeningItem(text)}
                      >
                        <p className="content_excerpt">{text.content}</p>
                      </td>
                      <td
                      title="delete this item"
                      className="delete_td"
                      onClick={(event) => onDeleteItem(text.type, text.id)}
                      >
                        <i className="material-icons">delete</i>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
            <div id="content_topright">
              {deleting && <p>deleting<span className="blinking_dots">...</span></p>}
            </div>
          </div>
          }
        {/* ----------------------------
        // #NEW NOTES DISPLAY
        // ----------------------------*/}
        {displayedMenu == 'new_notes' &&
          <div id="show_content" data-content="menu">
            <h2>
              NEW NOTES<span id="underscore">_</span>
            </h2>
            <hr />
            <form className="new_item_form" onSubmit={(event) => this.handleNewTextSubmit(event)}>
                <div className="form_row">
                  <input
                  className={blur ? 'blured' : ''}
                  ref={this.title}
                  type="text"
                  placeholder="TITLE"
                  required="required"
                  onChange={(event) => watchItemCreation(event, 'text', 'name')} // handle input change
                  value={creatingItem.text.name}
                  />
                  <div id="div_for_pinned_input">
                    <label htmlFor="pin_input">Pinned</label>
                    <input
                    ref={this.pinned}
                    id="pin_input"
                    type="checkbox"
                    onChange={(event) => watchItemCreation(event, 'text', 'pinned')} // handle input change
                    checked={creatingItem.text.pinned}
                    />
                  </div>
                </div>

                <textarea
                  className={blur ? 'blured' : ''}
                  ref={this.text}
                  placeholder="Start Writing..."
                  required="required"
                  onChange={(event) => watchItemCreation(event, 'text', 'content')} // handle input change
                  value={creatingItem.text.content}
                />
                // Is an API action processing ?
                {!saving && <button className="form_submit blur" type="submit">Save</button>}

            </form>

            <div id="content_topright">
              {onGoing && <i
                title="clear"
                className="material-icons clear_form"
                onClick={(event) => clearForm(event, 'text')}
              >block</i>}
              {saving && <p className="saving_sign">saving<span className="blinking_dots">...</span></p>}
            </div>
          </div>
          }
        {/* ----------------------------
        //TODO ALBUM DISPLAY
        // ----------------------------*/}
        {displayedMenu == 'album' &&
          <div id="show_content" data-content="menu">
            <h2>
              ALBUM<span id="underscore">_</span>
            </h2>
            <hr />
            <p className="excuses">I'm truly sorry but a few features (like pictures and other medias) are not implemented yet.</p>
            <p className="excuses" style={{textAlign: 'right'}}>Have a good one,<br />
            Faber Smythe</p>
          </div>
        }
        {/* ----------------------------
        //TODO NEW IMAGE DISPLAY
        // ----------------------------*/}
        {displayedMenu == 'new_image' &&
        <div id="show_content" data-content="menu">
          <h2>
            NEW IMAGE<span id="underscore">_</span>
          </h2>
          <hr />
          <p className="excuses">I'm truly sorry but a few features (like pictures and other medias) are not implemented yet.</p>
          <p className="excuses" style={{textAlign: 'right'}}>Have a good one,<br />
          Faber Smythe</p>
        </div>
        }
      </Scrollbars>

    )
  }
}

DisplayMenu.propTypes = {
  displayedMenu: PropTypes.string.isRequired,
  blur: PropTypes.bool.isRequired,
  textItems: PropTypes.array.isRequired,
  onOpeningItem: PropTypes.func.isRequired,
  onPinning: PropTypes.func.isRequired,
  onDeleteItem: PropTypes.func.isRequired,
  saving: PropTypes.bool.isRequired,
  deleting: PropTypes.bool.isRequired,
  creatingItem: PropTypes.object,
  watchItemCreation: PropTypes.func.isRequired,
  clearForm: PropTypes.func.isRequired,
};
