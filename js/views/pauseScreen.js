/** ******************************************************************
 PAUSE SCREEN
 *********************************************************************/
var React = require('react'),
    ReactDOM = require('react-dom'),
    ClassNames = require('classnames'),
    ControlBar = require('../components/controlBar'),
    AdOverlay = require('../components/adOverlay'),
    UpNextPanel = require('../components/upNextPanel'),
    TextTrackPanel = require('../components/textTrackPanel'),
    Watermark = require('../components/watermark'),
    ResizeMixin = require('../mixins/resizeMixin'),
    Icon = require('../components/icon'),
    SkipControls = require('../components/skipControls'),
    Utils = require('../components/utils'),
    CONSTANTS = require('./../constants/constants'),
    AnimateMixin = require('../mixins/animateMixin'),
    ViewControlsVr = require('../components/viewControlsVr');
var createReactClass = require('create-react-class');
const withAutoHide = require('./higher-order/withAutoHide.js');

class PauseScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      descriptionText: this.props.contentTree.description,
      containsText:
        (this.props.skinConfig.pauseScreen.showTitle && !!this.props.contentTree.title) ||
        (this.props.skinConfig.pauseScreen.showDescription && !!this.props.contentTree.description),
      controlBarVisible: true,
      animate: false
    };

    this.handlePlayerMouseMove = this.handlePlayerMouseMove.bind(this);
    this.handleVrMouseUp = this.handleVrMouseUp.bind(this);
    this.handleVrTouchEnd = this.handleVrTouchEnd.bind(this);
    this.handlePlayerMouseDown = this.handlePlayerMouseDown.bind(this);
    this.handlePlayerMouseUp = this.handlePlayerMouseUp.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.startAnimation = this.startAnimation.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
  }

  componentDidMount() {
    this.animateTimer = setTimeout(this.startAnimation, 1);
    this.handleResize();
    this.hideVrPauseButton();
    document.addEventListener('mousemove', this.handlePlayerMouseMove, false);
    document.addEventListener('touchmove', this.handlePlayerMouseMove, false);
    document.addEventListener('mouseup', this.handleVrMouseUp, false);
    document.addEventListener('touchend', this.handleVrTouchEnd, false);
  }

  componentWillUnmount() {
    clearTimeout(this.animateTimer);
    this.props.controller.enablePauseAnimation();
    document.removeEventListener('mousemove', this.handlePlayerMouseMove);
    document.removeEventListener('touchmove', this.handlePlayerMouseMove);
    document.removeEventListener('mouseup', this.handleVrMouseUp);
    document.removeEventListener('touchend', this.handleVrTouchEnd);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.componentWidth !== this.props.componentWidth) {
      this.handleResize(nextProps);
    }
  }

  /**
   * Sets the animate state to true.
   * @private
   */
  startAnimation() {
    this.setState({
      animate: true
    });
  }

  /**
   * Handles when the player changes size.
   * @private
   */
  handleResize() {
    if (ReactDOM.findDOMNode(this.refs.description)) {
      this.setState({
        descriptionText: Utils.truncateTextToWidth(
          ReactDOM.findDOMNode(this.refs.description),
          this.props.contentTree.description
        )
      });
    }
  }

  handleClick(event) {
    if (this.props.controller.videoVr) {
      event.preventDefault();
    }
    if (!this.props.isVrMouseMove && !this.props.controller.state.isMobile) {
      this.props.controller.togglePlayPause(event);
    }
    this.props.controller.state.accessibilityControlsEnabled = true;
    this.props.controller.state.isClickedOutside = false;
    this.props.handleVrPlayerClick();
  }

  /**
   * call handleTouchEnd when touchend was called on selectedScreen and videoType is Vr
   * @param {Event} e - event object
   */
  handleTouchEnd(e) {
    if (this.props.controller.state.controlBarVisible) {
      var shouldToggle = false;
      if (this.props.controller.videoVr) {
        e.preventDefault();
        if (!this.props.isVrMouseMove) {
          shouldToggle = true;
        }
      } else {
        shouldToggle = true;
      }
      if (shouldToggle) {
        this.props.controller.togglePlayPause(e);
      }
    }
  }

  /**
   * call handleVrTouchEnd when touchend was called on selectedScreen and videoType is Vr
   * @param {Event} e - event object
   */
  handleVrTouchEnd(e) {
    this.props.handleVrPlayerMouseUp(e);
  }

  /**
   * remove the button on pause screen for correct checking mouse movement
   */
  hideVrPauseButton() {
    if (this.props.controller.videoVr) {
      var pauseButton = document.getElementById('oo-pause-button');
      setTimeout(function() {
        if (pauseButton) {
          pauseButton.style.display = 'none';
        }
      }, 1000);
    }
  }

  handlePlayerMouseDown(e) {
    if (this.props.controller.videoVr) {
      e.persist();
    }
    this.props.controller.state.accessibilityControlsEnabled = true;
    this.props.controller.state.isClickedOutside = false;
    this.props.handleVrPlayerMouseDown(e);
  }

  handlePlayerMouseMove(e) {
    this.props.handleVrPlayerMouseMove(e);
  }

  /**
   * call handleVrMouseUp when mouseup was called on selectedScreen
   * @param {Event} e - event object
   */
  handlePlayerMouseUp(e) {
    e.stopPropagation(); // W3C
    e.cancelBubble = true; // IE
  }

  /**
   * call handleVrMouseUp when mouseup was called on document
   * @param {Event} e - event object
   */
  handleVrMouseUp(e) {
    this.props.handleVrPlayerMouseUp(e);
  }

  /**
   * Make sure keyboard controls are active when a focusable element has focus.
   *
   * @param {Event} event - Focus event object
   */
  handleFocus(event) {
    var isFocusableElement = event.target || event.target.hasAttribute(CONSTANTS.KEYBD_FOCUS_ID_ATTR);
    if (isFocusableElement) {
      this.props.controller.state.accessibilityControlsEnabled = true;
      this.props.controller.state.isClickedOutside = false;
    }
  }

  render() {
    // inline style for config/skin.json elements only
    var titleStyle = {
      color: this.props.skinConfig.startScreen.titleFont.color
    };
    var descriptionStyle = {
      color: this.props.skinConfig.startScreen.descriptionFont.color
    };
    var actionIconStyle = {
      color: this.props.skinConfig.pauseScreen.PauseIconStyle.color,
      opacity: this.props.skinConfig.pauseScreen.PauseIconStyle.opacity
    };

    // CSS class manipulation from config/skin.json
    var fadeUnderlayClass = ClassNames({
      'oo-fading-underlay': true,
      'oo-fading-underlay-active': this.props.pauseAnimationDisabled && this.props.controller.state.controlBarVisible,
      'oo-animate-fade': this.state.animate && !this.props.pauseAnimationDisabled && this.props.controller.state.controlBarVisible
    });
    var infoPanelClass = ClassNames({
      'oo-state-screen-info': true,
      'oo-inactive': !this.props.controller.state.controlBarVisible,
      'oo-info-panel-top':
        this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('top') > -1,
      'oo-info-panel-bottom':
        this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('bottom') > -1,
      'oo-info-panel-left':
        this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('left') > -1,
      'oo-info-panel-right':
        this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('right') > -1
    });
    var titleClass = ClassNames({
      'oo-state-screen-title': true,
      'oo-text-truncate': true,
      'oo-pull-right': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('right') > -1
    });
    var descriptionClass = ClassNames({
      'oo-state-screen-description': true,
      'oo-pull-right': this.props.skinConfig.pauseScreen.infoPanelPosition.toLowerCase().indexOf('right') > -1
    });

    var actionIconClass = ClassNames({
      'oo-action-icon-pause': !this.props.pauseAnimationDisabled,
      'oo-action-icon': this.props.pauseAnimationDisabled,
      'oo-animate-pause': this.state.animate && !this.props.pauseAnimationDisabled,
      'oo-action-icon-top':
        this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf('top') > -1,
      'oo-action-icon-bottom':
        this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf('bottom') > -1,
      'oo-action-icon-left':
        this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf('left') > -1,
      'oo-action-icon-right':
        this.props.skinConfig.pauseScreen.pauseIconPosition.toLowerCase().indexOf('right') > -1,
      'oo-hidden': !this.props.skinConfig.pauseScreen.showPauseIcon || this.props.pauseAnimationDisabled
    });

    var titleMetadata = (
      <div className={titleClass} style={titleStyle}>
        {this.props.contentTree.title}
      </div>
    );
    var descriptionMetadata = (
      <div className={descriptionClass} ref="description" style={descriptionStyle}>
        {this.state.descriptionText}
      </div>
    );

    var adOverlay =
      this.props.controller.state.adOverlayUrl && this.props.controller.state.showAdOverlay ? (
        <AdOverlay
          {...this.props}
          overlay={this.props.controller.state.adOverlayUrl}
          showOverlay={this.props.controller.state.showAdOverlay}
          showOverlayCloseButton={this.props.controller.state.showAdOverlayCloseButton}
        />
      ) : null;

    var upNextPanel =
      this.props.controller.state.upNextInfo.showing && this.props.controller.state.upNextInfo.upNextData ? (
        <UpNextPanel
          {...this.props}
          controlBarVisible={this.props.controller.state.controlBarVisible}
          currentPlayhead={this.props.currentPlayhead}
        />
      ) : null;

    var viewControlsVr = this.props.controller.videoVr ? (
      <ViewControlsVr {...this.props} controlBarVisible={this.props.controller.state.controlBarVisible} />
    ) : null;

    var skipControlsEnabled = Utils.getPropertyValue(
      this.props.skinConfig,
      'skipControls.enabled',
      false
    );
    var isTextTrackInBackground = (
      skipControlsEnabled ||
      this.props.controller.state.scrubberBar.isHovering
    );

    if (this.state.containsText && this.props.controller.state.controlBarVisible) {
      this.props.controller.addBlur();
    } else {
      this.props.controller.removeBlur();
    }

    return (
      <div className="oo-state-screen oo-pause-screen">
        {!this.props.controller.videoVr && this.state.containsText && <div className={fadeUnderlayClass} />}

        <div
          className={CONSTANTS.CLASS_NAMES.SELECTABLE_SCREEN}
          onClick={this.handleClick}
          onMouseDown={this.handlePlayerMouseDown}
          onTouchStart={this.handlePlayerMouseDown}
          onMouseUp={this.handlePlayerMouseUp}
          onTouchEnd={this.handleTouchEnd} />

        <Watermark
          {...this.props}
          controlBarVisible={this.props.controller.state.controlBarVisible} />

        <div className={infoPanelClass}>
          {this.props.skinConfig.pauseScreen.showTitle ? titleMetadata : null}
          {this.props.skinConfig.pauseScreen.showDescription ? descriptionMetadata : null}
        </div>

        <button
          id="oo-pause-button"
          type="button"
          className={actionIconClass}
          onClick={this.handleClick}
          aria-hidden="true"
          tabIndex="-1">
          <Icon {...this.props} icon="pause" style={actionIconStyle} />
        </button>

        {viewControlsVr}

        {skipControlsEnabled &&
          <SkipControls
            config={this.props.controller.state.skipControls}
            language={this.props.language}
            localizableStrings={this.props.localizableStrings}
            responsiveView={this.props.responsiveView}
            skinConfig={this.props.skinConfig}
            controller={this.props.controller}
            currentPlayhead={this.props.currentPlayhead}
            a11yControls={this.props.controller.accessibilityControls}
            isInactive={!this.props.controller.state.controlBarVisible}
            isInBackground={this.props.controller.state.scrubberBar.isHovering}
            onFocus={this.handleFocus} />
        }

        <div className="oo-interactive-container" onFocus={this.handleFocus}>
          {this.props.closedCaptionOptions.enabled && (
            <TextTrackPanel
              closedCaptionOptions={this.props.closedCaptionOptions}
              cueText={this.props.closedCaptionOptions.cueText}
              direction={this.props.captionDirection}
              responsiveView={this.props.responsiveView}
              isInBackground={isTextTrackInBackground} />
          )}

          {adOverlay}

          {upNextPanel}

          <ControlBar
            {...this.props}
            controlBarVisible={this.props.controller.state.controlBarVisible}
            playerState={this.props.playerState}
            isLiveStream={this.props.isLiveStream} />
        </div>

      </div>
    );
  }
}

const PauseScreenWithAutoHide = withAutoHide(PauseScreen);

export {PauseScreen, PauseScreenWithAutoHide};
