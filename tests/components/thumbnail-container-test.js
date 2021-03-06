jest.dontMock('../../js/components/thumbnailContainer')
  .dontMock('../../js/components/thumbnailCarousel')
  .dontMock('../../js/components/thumbnail')
  .dontMock('../../js/components/utils');

var React = require('react');
var Enzyme = require('enzyme');
var ReactDOM = require('react-dom');
var ThumbnailContainer = require('../../js/components/thumbnailContainer');
var ThumbnailCarousel = require('../../js/components/thumbnailCarousel');
var Thumbnail = require('../../js/components/thumbnail');
var Utils = require('../../js/components/utils');

describe('ThumbnailContainer', function() {
  var thumbnails = {
    'data':{
      'available_time_slices':[
        0,
        10,
        20,
        30,
        40,
        50,
        60,
        70,
        80,
        90,
        100
      ],
      'available_widths':[
        120
      ],
      'thumbnails':{
        '0':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_000.jpg',
            'width':120,
            'height':80
          }
        },
        '10':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_010.jpg',
            'width':120,
            'height':80
          }
        },
        '20':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_020.jpg',
            'width':120,
            'height':80
          }
        },
        '30':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_030.jpg',
            'width':120,
            'height':80
          }
        },
        '40':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_040.jpg',
            'width':120,
            'height':80
          }
        },
        '50':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_050.jpg',
            'width':120,
            'height':80
          }
        },
        '60':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_060.jpg',
            'width':120,
            'height':80
          }
        },
        '70':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_070.jpg',
            'width':120,
            'height':80
          }
        },
        '80':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_080.jpg',
            'width':320,
            'height':160
          }
        },
        '90':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_090.jpg',
            'width':120,
            'height':80
          }
        },
        '100':{
          '120':{
            'url':'http://media.video-cdn.espn.com/motion/Miercoles_100.jpg',
            'width':120,
            'height':80
          }
        }
      },
      'errors':[
        {
          'status':404,
          'code':'Not Found',
          'title':'unable to find thumbnail images',
          'detail':'embed code not found'
        }
      ]
    }
  };

  var testThumbnails = function(wrapper, thumbnails, hoverTime, width, duration) {
    var hoverPosition = Utils.findThumbnail(thumbnails, hoverTime, duration).pos;
    var centerImage = wrapper.find('.oo-thumbnail').getDOMNode();
    var images = centerImage.parentNode.childNodes;

    var lastLeft = 0;
    var next = 0;
    for (var i = 0; i < hoverPosition && i < images.length; i++) {
      var imageStyle = images[i].style;
      var img = imageStyle._values['background-image'];
      var left = parseInt(imageStyle._values['left']);
      if (i > 0 && left > lastLeft) { // left edge of scrubber bar reached,  now check images to the right of central, remember index where we stopped
        next = hoverPosition - i;
        break;
      }
      var offset = img.indexOf('url(') + 4;
      lastLeft = left;
      expect(img.slice(offset, -1)).toBe(thumbnails.data.thumbnails[thumbnails.data.available_time_slices[hoverPosition - i]][width]['url']);
    }
    for (var i = hoverPosition + 1 - next; i < images.length; i++) {
      var imageStyle = images[i]._style;
      var img = imageStyle._values['background-image'];
      var offset = img.indexOf('url(') + 4;
      expect(img.slice(offset, -1)).toBe(thumbnails.data.thumbnails[thumbnails.data.available_time_slices[i + next]][width]['url']);
    }
  };

  var vrViewingDirection = {yaw: 180, roll: 0, pitch: 0};
  var duration = 100;
  var hoverTime = 80;
  var scrubberBarWidth = 470;
  var hoverPosition = 80;

  it('for isCarousel = false need to show thumbnails', function() {
    var wrapper = Enzyme.mount(
      <ThumbnailContainer
        thumbnails={thumbnails}
        isCarousel={false}
        hoverPosition={hoverPosition}
        duration={duration}
        hoverTime={hoverTime}
        scrubberBarWidth={scrubberBarWidth}
        vrViewingDirection={vrViewingDirection}
        videoVr={true}
        fullscreen={false}
      />
    );
    var thumbnailContainer = wrapper.find('.oo-scrubber-thumbnail-wrapper');
    var thumbnail = wrapper.find('.oo-scrubber-thumbnail-container');
    expect(thumbnail).not.toBeNull();
  });

  it('creates and verifies thumbnails at hover times of [0, 100], step 5', function() {
    var width = thumbnails.data.available_widths[0];
    for (var hoverTime = 0; hoverTime <= 100; hoverTime += 5) {
      var wrapper = Enzyme.mount(
        <ThumbnailContainer
          thumbnails={thumbnails}
          isCarousel={false}
          hoverPosition={hoverPosition}
          duration={duration}
          hoverTime={hoverTime}
          scrubberBarWidth={scrubberBarWidth}
          vrViewingDirection={vrViewingDirection}
          videoVr={true}
          fullscreen={false}
        />
      );
      var node = wrapper.find('.oo-thumbnail').getDOMNode();
      if (hoverTime % 10 == 0) {
        expect(node.style._values['background-image']).toBe('url('+thumbnails.data.thumbnails[hoverTime][width]['url']+')');
      } else {
        expect(node.style._values['background-image']).toBe('url('+thumbnails.data.thumbnails[(hoverTime - 5).toString()][width]['url']+')');
      }
    }
  });

  it('test generation of left and right thumbnails at various times', function() {
    var width = thumbnails.data.available_widths[0];
    for (var hoverTime = 0; hoverTime <= 100; hoverTime += 5) {
      var wrapper = Enzyme.mount(
        <ThumbnailContainer
          thumbnails={thumbnails}
          isCarousel={false}
          hoverPosition={hoverPosition}
          duration={duration}
          hoverTime={hoverTime}
          scrubberBarWidth={scrubberBarWidth}
          vrViewingDirection={vrViewingDirection}
          videoVr={true}
          fullscreen={false}
        />
      );
      testThumbnails(wrapper, thumbnails, hoverTime, width, duration);
    }
  });

  it('for isCarousel = true need to show thumbnails', function() {
    var wrapper = Enzyme.mount(
      <ThumbnailContainer
        thumbnails={thumbnails}
        isCarousel={true}
        hoverPosition={hoverPosition}
        duration={duration}
        hoverTime={hoverTime}
        scrubberBarWidth={scrubberBarWidth}
        vrViewingDirection={vrViewingDirection}
        videoVr={true}
        fullscreen={false}
      />
    );
    var thumbnailContainer = wrapper.find('.oo-scrubber-thumbnail-wrapper');
    var thumbnailCarousel = wrapper.find('.oo-scrubber-carousel-container');
    expect(thumbnailCarousel).not.toBeNull();
  });

  it('tests functions for vr preview', function() {
    var wrapper = Enzyme.mount(
      <ThumbnailContainer
        thumbnails={thumbnails}
        isCarousel={false}
        hoverPosition={hoverPosition}
        duration={duration}
        hoverTime={hoverTime}
        scrubberBarWidth={scrubberBarWidth}
        vrViewingDirection={vrViewingDirection}
        videoVr={true}
        fullscreen={false}
      />
    );
    var coef = wrapper.instance().getCurrentYawVr(380);
    expect(coef).toBe(20);

    var params = {
      yaw: wrapper.instance().props.vrViewingDirection.yaw,
      pitch: wrapper.instance().props.vrViewingDirection.pitch,
      imageWidth: 80,
      imageHeight: 40,
      thumbnailWidth: 320,
      thumbnailHeight: 160
    };
    var positions = wrapper.instance().setBgPositionVr(params);
    var positionX = positions.positionX;
    var positionY = positions.positionY;
    expect(positionX).toBe(120);
    expect(positionY).toBe(0);

    //var thumbnail = wrapper.getDOMNode();
    var thumbnail = wrapper.instance().child.refs.thumbnail;
    thumbnail.getBoundingClientRect = function() {
      return {
        width: 80,
        height: 40
      }
    };

    var refName = 'thumbnail', widthName = 'thumbnailWidth', heightName = 'thumbnailHeight';
    wrapper.instance().setThumbnailSize(refName, widthName, heightName);
    expect(wrapper.instance().thumbnailWidth).toBe(80);
    expect(wrapper.instance().thumbnailHeight).toBe(40);

    wrapper.instance().setImageSizes();
    expect(wrapper.instance().imageWidth).toBe(320);
    expect(wrapper.instance().imageHeight).toBe(160);
  });
});