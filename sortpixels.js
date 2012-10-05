var sortPixels = (function(){

  // equivalent to rgb(103, 105, 128)
  var blackValue = -10000000;
  
  // equivalent to rgb(164, 114, 128)
  var whiteValue = -6000000;

//  var blackValue = (255 << 24) + (32<< 16) + (32 << 8) + 32;
  var brightnessValue = 30;
//  var whiteValue = (255 << 24) + (230<< 16) + (230 << 8) + 230;

  var saved = false;

  //MODE:
  //0 -> black
  //1 -> bright
  //2 -> white
  //b(16777216)
  var mode, row, column;
  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;
  var loops, loopCount;

  function init(img, newMode, newLoops) {
    mode = newMode || 0;
    loops = newLoops || 1;
    row = 0;
    column = 0;
    loopCount = 0;

    setup(img);
    draw();
    
    return canvas;
  }

  function setup(img) {
    canvas = document.createElement('canvas');
    width = canvas.width = img.naturalWidth;
    height = canvas.height = img.naturalHeight;

    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // document.body.appendChild(img);
    // document.body.appendChild(canvas);
    imageDataWrapper = ctx.getImageData(0, 0, width, height);
    imageData = imageDataWrapper.data;
  }

  function draw() {
    while(column < width-1) {
      sortColumn();
      column++;
    }
    
    while(row < height-1) {
      sortRow();
      row++;
    }
    
    if(loopCount++ >= loops) {
      ctx.putImageData(imageDataWrapper, 0, 0);
    }

    else {
      draw();
    }
  }

  function sortRow() {
    var x = 0;
    var y = row;
    var xend = 0;
    
    while(xend < width-1) {
      switch(mode) {
        case 0:
          x = getFirstNotBlackX(x, y);
          xend = getNextBlackX(x, y);
          break;
        case 1:
          x = getFirstBrightX(x, y);
          xend = getNextDarkX(x, y);
          break;
        case 2:
          x = getFirstNotWhiteX(x, y);
          xend = getNextWhiteX(x, y);
          break;
        default:
          break;
      }
      
      if (x < 0) break;
      
      var sortLength = xend-x;
      
      var unsorted = new Array(sortLength);
      var sorted = new Array(sortLength);
      
      for(var i=0; i<sortLength; i++) {
        unsorted[i] = getPixelValue(x + i, y);
      }
      
      sorted = unsorted.sort();
      
      for(var i=0; i<sortLength; i++) {
        setPixelValue(x + i, y, sorted[i]);
      }
      
      x = xend+1;
    }
  }


  function sortColumn() {
    var x = column;
    var y = 0;
    var yend = 0;
    
    while(yend < height-1) {
      switch(mode) {
        case 0:
          y = getFirstNotBlackY(x, y);
          yend = getNextBlackY(x, y);
          break;
        case 1:
          y = getFirstBrightY(x, y);
          yend = getNextDarkY(x, y);
          break;
        case 2:
          y = getFirstNotWhiteY(x, y);
          yend = getNextWhiteY(x, y);
          break;
        default:
          break;
      }
      
      if (y < 0) break;
      
      var sortLength = yend-y;
      
      var unsorted = new Array(sortLength);
      var sorted = new Array(sortLength);
      
      for(var i=0; i<sortLength; i++) {
        unsorted[i] = getPixelValue(x, y+i);
      }
      
      sorted = unsorted.sort();
      
      for(var i=0; i<sortLength; i++) {
        setPixelValue(x, y+i, sorted[i]);
      }
      
      y = yend+1;
    }
  }


  function setPixelValue(x, y, val) {
    var offset = (x + y * width) * 4;
    var r = (val >> 16) & 255;
    var g = (val >> 8) & 255;
    var b = val & 255;
    imageData[offset] = r;
    imageData[offset+1] = g;
    imageData[offset+2] = b;
  }
  function getPixelValue(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];

    return ( ((255 << 8) | r) << 8 | g) << 8 | b;
  }
  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    // HSL - lightness:
    // return (Math.max(r,g,b) + Math.min(r,g,b)) / 2
    // HSV - value:
    return Math.max(r,g,b) / 255 * 100;
  }

  //BLACK
  function getFirstNotBlackX(_x, _y) {
    var x = _x;
    var y = _y;

    while(getPixelValue(x, y) < blackValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextBlackX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelValue(x, y) > blackValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }

  //BRIGHTNESS
  function getFirstBrightX(_x, _y) {
    var x = _x;
    var y = _y;
    while(getPixelBrightness(x, y) < brightnessValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextDarkX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelBrightness(x, y) > brightnessValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }

  //WHITE
  function getFirstNotWhiteX(_x, _y) {
    var x = _x;
    var y = _y;
    while(getPixelValue(x, y) > whiteValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextWhiteX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelValue(x, y) < whiteValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }


  //BLACK
  function getFirstNotBlackY(_x, _y) {
    var x = _x;
    var y = _y;
    if(y < height) {
      while(getPixelValue(x, y) < blackValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextBlackY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelValue(x, y) > blackValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  //BRIGHTNESS
  function getFirstBrightY(_x, _y) {
    var x = _x;
    var y = _y;
    if (y < height) {
      while(getPixelBrightness(x, y) < brightnessValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextDarkY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelBrightness(x, y) > brightnessValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  //WHITE
  function getFirstNotWhiteY(_x, _y) {
    var x = _x;
    var y = _y;
    if (y < height) {
      while(getPixelValue(x, y) > whiteValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextWhiteY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelValue(x, y) < whiteValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  return init;

})();
