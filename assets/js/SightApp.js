
// ========================================
// SET UP
// ========================================
require('../css/DisplayMenu.css');
require('../css/DisplayItem.css');
require('../css/SightApp.css');
require('../css/MenuApp.css');
require('../css/PinBar.css');

const $ = require('jquery');

import {TweenMax, Power2, TimelineLite} from "gsap/TweenMax";

import React, { Component } from 'react';
import { render } from 'react-dom';
import PropTypes from 'prop-types';

import CustomCheckboxes from './OutsideScripts/CustomCheckboxes';

import { getMetaInfo, getTexts, deleteItem, createItem, pinItem, updateItem } from './api';
import PinBar from './PinBar';
import SideMenu from './SideMenu';
import DisplayItem from './DisplayItem';
import DisplayMenu from './DisplayMenu';



class SightApp extends Component {
  // ========================================
  // CONSTRUCT
  // ========================================
  constructor(props) {
    super(props);

    this.state = {
      metaInfo: {},
      textItems: [],
      pinnedItems:[[],[],[]],
      display: false,
      displayedItem: null,
      displayedMenu: '',
      blur: false,
      loading: true,
      saving: false,
      deleting: false,
      fullScreen: false,
      sound: true,
      fireCracking: false,
      creatingItem: {
        text: {name: '', content: '', pinned: false},
        image: {},
      },
    };

    // BINDING THE METHODS TO USE -$THIS- INSIDE
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleBlur = this.handleBlur.bind(this);
    this.unfoldDisplay = this.unfoldDisplay.bind(this);
    this.foldUpDisplay = this.foldUpDisplay.bind(this);
    this.keyListener = this.keyListener.bind(this);
    this.handleMenuClick = this.handleMenuClick.bind(this);
    this.handleOpeningItem = this.handleOpeningItem.bind(this);
    this.handlePinning = this.handlePinning.bind(this);
    this.compareItemIds = this.compareItemIds.bind(this);
    this.handleDeleteItem = this.handleDeleteItem.bind(this);
    this.addNewText = this.addNewText.bind(this);
    this.handleEditableChange = this.handleEditableChange.bind(this);
    this.startAudioFire = this.startAudioFire.bind(this);
    this.playAudioPaper = this.playAudioPaper.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
    this.watchItemCreation = this.watchItemCreation.bind(this);
    this.clearForm = this.clearForm.bind(this);

    // Initialize interval for handleEditableChange() down below
    this.textUpdateInterval = null;
    // Audio elements
    this.audioFire = React.createRef();
    this.audioPaper = React.createRef();
    this.audioSaving = React.createRef();
    this.audioCrumple = React.createRef();
  }

  // ========================================
  // LIFECYCLE
  // ========================================

  componentDidMount(){
    getMetaInfo().then((data) => {
      this.setState({ metaInfo: data });
    });

    getTexts().then((data) => {
      var pinned = [[], [], []];
      data.forEach(function(item){
        if(item.pinned){ pinned[0].push(item) }
      })

      this.setState({ textItems: data, pinnedItems: pinned, loading: false });
    });
    //TODO getImages

    this.getSoundCookie();
  }

  // ========================================
  // API METHODS
  // ========================================

  handleDeleteItem(type, idToDelete){
    if (typeof idToDelete !==  'undefined'){
      // Ask confirmation before definitive action
      if(confirm('The item will be definitely lost. Are you sure ?')){
        // An API action is processing
        this.setState({ deleting: true});

        // Delete through API
        deleteItem(type, idToDelete).then((data) => {
          this.setState({ deleting: false});
          if(this.state.sound){this.audioCrumple.current.play();}
        });

        // Delete in STATE
        if(type == 'text'){
          this.setState((prevState) => {
            var filteredTextItems = prevState.textItems.filter(item => item.id !== idToDelete)
            // Update the pinned Items in STATE (can't pin the deleted item anymore)
            var pinned = [[], [], []];
            filteredTextItems.forEach(function(item){
              if(item.pinned){ pinned[0].push(item) }
            })
            return {
                textItems: filteredTextItems,
                pinnedItems: pinned,
            };
          });
        }
        //TODO if item is type == image

        // Close the current note if it was the one to delete
        if(this.state.displayedItem && this.state.displayedItem.id === idToDelete && this.state.displayedItem.type === type){
          this.foldUpDisplay();
        }
      }
    }else{
      // Debug precaution
      alert("there has been an error, the item couldn't be deleted");
    }
  }

  // This method is called on an HTML element with EDITABLE-CONTENT
  handleEditableChange(event, itemType, itemChanging, field){
    if(itemType == 'text'){
      /*
       This interval is meant to avoid sending Requests on every keyboard input ; only when user stopped writing after 1.5 seconds.
       */
      clearTimeout(this.textUpdateInterval); // ignore previous trigger
      this.textUpdateInterval = setTimeout(() => { // wait to execute handler again
        // An API action is processing
        this.setState({saving: true});

        // Update through API
        var updatedItem = itemChanging;
        updatedItem[field] = event.target.value;
        updateItem(itemChanging.type, itemChanging.id, updatedItem).then((data) => {
          this.setState({saving: false});
        });

        // Update in STATE
        this.setState((prevState) => {
          var updatedItems = [];
          prevState.textItems.forEach(function(text){
            if(text.id == itemChanging.id){
              text[field] = event.target.value;
            }
            updatedItems.push(text);
          })
          return {
              textItems: updatedItems,
          };
        })
      }, 1500);
    }
    //TODO if item is type == image
  }

  addNewText(textItem){
    // PLay the noise while processing the request
    setTimeout(() => {this.audioSaving.current.play()}, 250);

    // An API action is processing + there is an unsaved item
    this.setState(prevState => {
      var updatedCreating = prevState.creatingItem;
      updatedCreating.text = {name: '', content: '', pinned: false};
      return{
        saving: true,
        creatingItem: updatedCreating,
      }
    })

    // Creating through API // WAIT for confirmation before creating in STATE (need incremented ID)
    createItem('text', textItem).then(data => {
      this.setState(prevState => {
          const newTextItems = [...prevState.textItems, data.action];
          var pinned = [[], [], []];
          newTextItems.forEach(function(item){
            if(item.pinned){ pinned[0].push(item) }
          })
          return {textItems: newTextItems, pinnedItems: pinned, displayedMenu: 'library', saving: false};
      });
    });
  }


  // ========================================
  // DYNAMIC INTERFACE METHODS
  // ========================================

  // Delete the unsaved item - called in DisplayMenu with onClick
  clearForm(event, type){
    this.setState((prevState) => {
      var creating = prevState.creatingItem;
      if(type == 'text'){
        creating.text = {name: '', content: '', pinned: false}
      }
      //TODO if item is type == image
      return {
          creatingItem: creating,
      };
    })
  }

  // Saving the fields' values  of an unsaved item in STATE - called in DisplayMenu with onChange
  watchItemCreation(event, type, field){
    // Initialize the changing field
    var creating_field = null;
    // Getting its value
    if($(event.target).is("input[type='checkbox']")){
      creating_field = event.target.checked;
    }else{
      creating_field = event.target.value;
    }
    // Assigning the new value to the [creatingItem] object in STATE
    this.setState((prevState) => {
      var creating = prevState.creatingItem;
      creating[type][field] = creating_field;
      return {
          creatingItem: creating,
      };
    })
  }

  // Play a sound and display the item - called in PinTab with onClick
  handleTabClick(event, item){
    // Close if the tab was already open
    if($(event.target).is('.active_tab')){
      this.foldUpDisplay();
    }else{
      if(!$(event.target).is('.tab_pin_sign')){
        // Ajust the class .active_tab for CSS
        if(document.querySelector('.active_tab') && !($(event.target).hasClass('.active_tab'))){
          $('.active_tab').removeClass('active_tab');
        }
        $(event.target).addClass('active_tab');
        // Actually open the item
        this.handleOpeningItem(item);
      }
    }
  }

  // Play a sound and display the menu content - called in MenuLink with onClick
  handleMenuClick(event, target){
    event.preventDefault();
    this.setState({displayedItem: null, displayedMenu:target});

    if(document.querySelector('.active_tab') && !($(event.target).hasClass('.active_tab'))){
      $('.active_tab').removeClass('active_tab');
    }

    this.unfoldDisplay();
    this.playAudioPaper();
  }

  // Open an item - called from this.handTabClick and in DisplayMenu with onClick
  handleOpeningItem(item){
    // Play paper sound
    this.playAudioPaper();
    // Open the main display if it wasn't already
    this.unfoldDisplay();
    // Set the content of the main display
    this.setState({displayedItem: item, displayedMenu: ''});
  }

  // Pin & Unpin the item to the PinBar - called in DisplayItem, DisplayMenu[library] with onChange,
  // - also called in PinTab with onClick
  handlePinning(item){
    // Pin/Upin through API
    pinItem(item.type, item.id)
    // Pin/Unpin in STATE
    if(item.pinned){
      // Unpin it
      this.setState((prevState) => {
          item.pinned = false;
          const newItems = prevState.textItems.filter(textItem => textItem.id !== item.id);
          newItems.push(item);
          // Update the pinnedItems in STATE
          var pinned = [[], [], []];
          newItems.forEach(function(item){
            if(item.pinned){ pinned[0].push(item) }
          })
          // Make order in STATE to keep the library clean
          newItems.sort(this.compareItemIds);
          return {
              textItems: newItems,
              pinnedItems: pinned,
          };
        });
    }else{
      // Pin it
      this.setState((prevState) => {
          item.pinned = true;
          const newItems = prevState.textItems.filter(textItem => textItem.id !== item.id);
          newItems.push(item);
          // Update the pinnedItems in STATE
          var pinned = [[], [], []];
          newItems.forEach(function(item){
            if(item.pinned){ pinned[0].push(item) }
          })
          // Make order in STATE to keep the library clean
          newItems.sort(this.compareItemIds);
          return {
              textItems: newItems,
              pinnedItems: pinned,
          };
      });
    }
  }

  // Toggles full screen mode for the main display - called from this.keyListener()
  // - also called in this.render() with onClick
  handleFullScreen(){
    if(this.state.fullScreen){
      this.setState({fullScreen: false})
      $('#topleft').css('display', 'flex');
    }else{
      this.setState({fullScreen: true})
      $('#topleft').css('display', 'none');
    }
  }

  // Global listener for keyboard shortcuts - called in this.render() with keydown listener
  keyListener(e) {
    // Close
    if(e.code == 'Escape'){
      if(this.state.fullScreen){
        this.setState({fullScreen : false})
        $('#topleft').css('display', 'flex');
      }else{
        this.foldUpDisplay();
        this.playAudioPaper();
      }
    }
    // Toggle Blur
    if(e.code == 'ControlRight'){
      this.handleBlur();
    }
    // Toggle Fullscreen
    if(e.code == 'AltRight'){
      this.handleFullScreen();
    }
  }

  // Toggle Blur on sensitive information - called in PinBar with onClick
  // - also called from this.keyListener()
  handleBlur(){
    if(this.state.blur){
      this.setState({blur: false})
    }else{
      this.setState({blur: true})
    }
  }

  // Open the main display if it wasn't already - called from this.handleMenuClick()
  // and from this.handleOpeningItem()
  unfoldDisplay(){
    if(this.state.display == false){
      $('#display').css('transform', 'none').css('opacity', '1');
      this.setState({display:true})
    }else{return null}
  }

  // Close the main display if it wasn't already - called in  this.render() with onTabClick
  // - also called from this.handleDeleteItem(), this.handleTabClick(), this.keyListener()
  foldUpDisplay(){
    if(this.state.display){
      $('#display').css('transform', 'scale(0.001) rotate3d(1, -1, 0, 90deg)').css('opacity', '0');
      this.setState({display:false})
      if(document.querySelector('.active_tab')){
        $('.active_tab').removeClass('active_tab');
      }
    }else{return null}
  }

  // Tool for array - called from this.handlePinning() to ordinate the items in STATE
  compareItemIds(a, b){
    if (a.id > b.id) return 1;
    if (b.id > a.id) return -1;
    return 0;
  }

  // Tool for array - called in this.render() to formate a prop (to have last items first)
  reverseArray(arr) {
    var newArray = [];
    for (var i = arr.length - 1; i >= 0; i--) {
      newArray.push(arr[i]);
    }
    return newArray;
}

  // Play background sound - called in this.render() with onClick
  startAudioFire(event){
    if(!($(event.target).is('#sound_input'))){
      if(!this.state.fireCracking && this.state.sound){
        this.audioFire.current.volume = 1;
        this.audioFire.current.play();
        this.setState({fireCracking : true});
      }
    }
  }

  // Play a random paper noise - called from this.handleMenuClick(), this.handleOpeningItem(), keyListener()
  playAudioPaper(event=null){
    if(this.state.sound){
      var src = "/sounds/paper_" + (Math.floor(Math.random() * 6)+1) + ".mp3";
      this.audioPaper.current.src = src;
      this.audioPaper.current.play();
    }
  }

  // Toggle preference for muting noises - called in PinBar with onClick
  toggleSound(event){
    if(this.state.sound){
      this.setState({sound: false})
      this.audioFire.current.pause();
      // set or update the cookie for sound preference
      var d = new Date();
      var days = 7; // duration of the cookie
      d.setTime(d.getTime() + (days*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = "sound=false;" + expires + "; path=/";

    }else{
      this.setState({sound: true})
      this.audioFire.current.play();
      // set or update the cookie for sound preference
      var d = new Date();
      var days = 7; // duration of the cookie
      d.setTime(d.getTime() + (days*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = "sound=true;" + expires + "; path=/";

    }
  }

  // Set default value on page load for sound - called from this.componentDidMount()
  getSoundCookie(){
    // intializing
    var cookie_value;
    // reading the cookie string
    var decoded = decodeURIComponent(document.cookie).split(';');
    for(var i = 0; i < decoded.length; i++) {
      var c = decoded[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf('sound=') == 0) {
        cookie_value =  c.substring('sound='.length, c.length);
      }
    }
    // update STATE according to cookie's value
    if(cookie_value == 'true'){
      this.setState({sound:true});
    }else{
      this.setState({sound:false});
      this.audioFire.current.pause();
    }
  }

  // ========================================
  // NOW RENDERING
  // ========================================
  render() {

    // lives in /OutsideScripts
    CustomCheckboxes();
    // Set global listener for keyboard shortcuts
    document.addEventListener('keydown', this.keyListener);

    const { textItems,
      displayedItem,
      displayedMenu,
      blur,
      loading,
      pinnedItems,
      metaInfo,
      saving,
      deleting,
      fullScreen,
      sound,
      creatingItem,
    } = this.state;

    return(
      <div id="react_container" onClick={(event) => this.startAudioFire(event)}>
        {/*audio elements*/}
        <audio ref={this.audioFire} loop preload='auto' src="/sounds/fire_cracking.mp3" type="audio/mpeg"></audio>
        <audio ref={this.audioPaper} preload='auto' src="" type="audio/mpeg"></audio>
        <audio ref={this.audioSaving} preload='auto' src="/sounds/saving.mp3" type="audio/mpeg"></audio>
        <audio ref={this.audioCrumple} preload='auto' src="/sounds/crumple.mp3" type="audio/mpeg"></audio>
        {/*pure graphic (CSS animated transparent lights)*/}
        <div className="animated_lights" id="fireplace" ></div>
        <div className="animated_lights" id="left_candle" ></div>
        <div className="animated_lights" id="right_candle" ></div>

        {/*main display*/}
        <div
        id="display"
        style={fullScreen ? {zIndex: '550', top: '0vh', height: '100vh', width: '100vw'} : {}}
        >
          {/*fixed inputs*/}
          <span
          id="fold_display_input"
          onClick={(event) => this.foldUpDisplay()}
          title="close (escape key)"
          >
            &#9587;
          </span>
          <i
          className="material-icons"
          id="fullscreen_input"
          onClick={(event) => this.handleFullScreen()}
          title='full screen'
          >
            {fullScreen ? 'fullscreen_exit' : 'fullscreen'}
          </i>
          {/*Is an item opened ?*/}
          {displayedItem &&
            <DisplayItem
            blur = {blur}
            displayedItem = {displayedItem}
            onEditableChange = {this.handleEditableChange}
            saving = {saving}
            onPinning = {this.handlePinning}
            onDeleteItem = {this.handleDeleteItem}
            />
          }
          {/*Was a MenuLink clicked ?*/}
          {!displayedItem &&
            <DisplayMenu
            blur = {blur}
            displayedMenu = {displayedMenu}
            textItems = {this.reverseArray(textItems)}
            onOpeningItem = {this.handleOpeningItem}
            onPinning = {this.handlePinning}
            onDeleteItem = {this.handleDeleteItem}
            metaInfo = {metaInfo}
            addNewText = {this.addNewText}
            saving = {saving}
            deleting = {deleting}
            creatingItem = {creatingItem}
            watchItemCreation = {this.watchItemCreation}
            clearForm = {this.clearForm}
            />
          }
        </div>
        {/* Menu fixed on the right */}
        <SideMenu
        displayedMenu = {displayedMenu}
        onMenuClick = {this.handleMenuClick}
        creatingItem = {creatingItem}
        />
        {/* PinBar interface fixed at the bottom */}
        <PinBar
        blur = {blur}
        handleBlur = {this.handleBlur}
        pinnedItems ={pinnedItems}
        onTabClick = {this.handleTabClick}
        loading = {loading}
        onPinning = {this.handlePinning}
        toggleSound = {this.toggleSound}
        sound = {sound}
        />
      </div>
    )
  }
}

// SEND TO THE BUILDER
render(<SightApp />, document.querySelector('#root'));
