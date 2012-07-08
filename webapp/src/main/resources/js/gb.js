(function() {
  /*!
 * jQuery Cookie Plugin
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function($) {
    $.cookie = function(key, value, options) {

        // key and at least value given, set cookie...
        if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value === null || value === undefined)) {
            options = $.extend({}, options);

            if (value === null || value === undefined) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path    ? '; path=' + options.path : '',
                options.domain  ? '; domain=' + options.domain : '',
                options.secure  ? '; secure' : ''
            ].join(''));
        }

        // key and possibly options given, get cookie...
        options = value || {};
        var decode = options.raw ? function(s) { return s; } : decodeURIComponent;

        var pairs = document.cookie.split('; ');
        for (var i = 0, pair; pair = pairs[i] && pairs[i].split('='); i++) {
            if (decode(pair[0]) === key) return decode(pair[1] || ''); // IE saves cookies with empty string as "c; ", e.g. without "=" as opposed to EOMB, thus pair[1] may be undefined
        }
        return null;
    };
})(jQuery);;
  /*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);;
  /*! Copyright (c) 2011 Piotr Rochala (http://rocha.la)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Version: 0.5.0
 * 
 */
(function($) {

  jQuery.fn.extend({
    slimScroll: function(options) {

      var defaults = {
        wheelStep : 20,
        width : 'auto',
        height : '250px',
        size : '7px',
        color: '#000',
        position : 'right',
        distance : '1px',
        start : 'top',
        opacity : .4,
        alwaysVisible : false,
        railVisible : false,
        railColor : '#333',
        railOpacity : '0.2',
        railClass : 'slimScrollRail',
        barClass : 'slimScrollBar',
        wrapperClass : 'slimScrollDiv',
        allowPageScroll: false,
        scroll: 0
      };

      var o = ops = $.extend( defaults , options );

      // do it for every element that matches selector
      this.each(function(){

      var isOverPanel, isOverBar, isDragg, queueHide, barHeight, percentScroll,
        divS = '<div></div>',
        minBarHeight = 30,
        releaseScroll = false,
        wheelStep = parseInt(o.wheelStep),
        cwidth = o.width,
        cheight = o.height,
        size = o.size,
        color = o.color,
        position = o.position,
        distance = o.distance,
        start = o.start,
        opacity = o.opacity,
        alwaysVisible = o.alwaysVisible,
        railVisible = o.railVisible,
        railColor = o.railColor,
        railOpacity = o.railOpacity,
        allowPageScroll = o.allowPageScroll,
        scroll = o.scroll;
      
        // used in event handlers and for better minification
        var me = $(this);

        //ensure we are not binding it again
        if (me.parent().hasClass('slimScrollDiv'))
        {
            //check if we should scroll existing instance
            if (scroll)
            {
                //find bar and rail
                bar = me.parent().find('.slimScrollBar');
                rail = me.parent().find('.slimScrollRail');

                //scroll by given amount of pixels
                scrollContent( me.scrollTop() + parseInt(scroll), false, true);
            }

            return;
        }

        // wrap content
        var wrapper = $(divS)
          .addClass( o.wrapperClass )
          .css({
            position: 'relative',
            overflow: 'hidden',
            width: cwidth,
            height: cheight
          });

        // update style for the div
        me.css({
          overflow: 'hidden',
          width: cwidth,
          height: cheight
        });

        // create scrollbar rail
        var rail  = $(divS)
          .addClass( o.railClass )
          .css({
            width: size,
            height: '100%',
            position: 'absolute',
            top: 0,
            display: (alwaysVisible && railVisible) ? 'block' : 'none',
            'border-radius': size,
            background: railColor,
            opacity: railOpacity,
            zIndex: 90
          });

        // create scrollbar
        var bar = $(divS)
          .addClass( o.barClass )
          .css({
            background: color,
            width: size,
            position: 'absolute',
            top: 0,
            opacity: opacity,
            display: alwaysVisible ? 'block' : 'none',
            'border-radius' : size,
            BorderRadius: size,
            MozBorderRadius: size,
            WebkitBorderRadius: size,
            zIndex: 99
          });

        // set position
        var posCss = (position == 'right') ? { right: distance } : { left: distance };
        rail.css(posCss);
        bar.css(posCss);

        // wrap it
        me.wrap(wrapper);

        // append to parent div
        me.parent().append(bar);
        me.parent().append(rail);

        // make it draggable
        bar.draggable({ 
          axis: 'y', 
          containment: 'parent',
          start: function() { isDragg = true; },
          stop: function() { isDragg = false; hideBar(); },
          drag: function(e) 
          { 
            // scroll content
            scrollContent(0, $(this).position().top, false);
          }
        });

        // on rail over
        rail.hover(function(){
          showBar();
        }, function(){
          hideBar();
        });

        // on bar over
        bar.hover(function(){
          isOverBar = true;
        }, function(){
          isOverBar = false;
        });

        // show on parent mouseover
        me.hover(function(){
          isOverPanel = true;
          showBar();
          hideBar();
        }, function(){
          isOverPanel = false;
          hideBar();
        });

        var _onWheel = function(e)
        {
          // use mouse wheel only when mouse is over
          if (!isOverPanel) { return; }

          var e = e || window.event;

          var delta = 0;
          if (e.wheelDelta) { delta = -e.wheelDelta/120; }
          if (e.detail) { delta = e.detail / 3; }

          // scroll content
          scrollContent(delta, true);

          // stop window scroll
          if (e.preventDefault && !releaseScroll) { e.preventDefault(); }
          if (!releaseScroll) { e.returnValue = false; }
        }

        function scrollContent(y, isWheel, isJump)
        {
          var delta = y;

          if (isWheel)
          {
            // move bar with mouse wheel
            delta = parseInt(bar.css('top')) + y * wheelStep / 100 * bar.outerHeight();

            // move bar, make sure it doesn't go out
            var maxTop = me.outerHeight() - bar.outerHeight();
            delta = Math.min(Math.max(delta, 0), maxTop);

            // scroll the scrollbar
            bar.css({ top: delta + 'px' });
          }

          // calculate actual scroll amount
          percentScroll = parseInt(bar.css('top')) / (me.outerHeight() - bar.outerHeight());
          delta = percentScroll * (me[0].scrollHeight - me.outerHeight());

          if (isJump)
          {
            delta = y;
            var offsetTop = delta / me[0].scrollHeight * me.outerHeight();
            bar.css({ top: offsetTop + 'px' });
          }

          // scroll content
          me.scrollTop(delta);

          // ensure bar is visible
          showBar();

          // trigger hide when scroll is stopped
          hideBar();
        }

        var attachWheel = function()
        {
          if (window.addEventListener)
          {
            this.addEventListener('DOMMouseScroll', _onWheel, false );
            this.addEventListener('mousewheel', _onWheel, false );
          } 
          else
          {
            document.attachEvent("onmousewheel", _onWheel)
          }
        }

        // attach scroll events
        attachWheel();

        function getBarHeight()
        {
          // calculate scrollbar height and make sure it is not too small
          barHeight = Math.max((me.outerHeight() / me[0].scrollHeight) * me.outerHeight(), minBarHeight);
          bar.css({ height: barHeight + 'px' });
        }

        // set up initial height
        getBarHeight();

        function showBar()
        {
          // recalculate bar height
          getBarHeight();
          clearTimeout(queueHide);

          // release wheel when bar reached top or bottom
          releaseScroll = allowPageScroll && percentScroll == ~~ percentScroll;

          // show only when required
          if(barHeight >= me.outerHeight()) {
            //allow window scroll
            releaseScroll = true;
            return;
          }
          bar.stop(true,true).fadeIn('fast');
          if (railVisible) { rail.stop(true,true).fadeIn('fast'); }
        }

        function hideBar()
        {
          // only hide when options allow it
          if (!alwaysVisible)
          {
            queueHide = setTimeout(function(){
              if (!isOverBar && !isDragg) 
              { 
                bar.fadeOut('slow');
                rail.fadeOut('slow');
              }
            }, 1000);
          }
        }

        // check start position
        if (start == 'bottom') 
        {
          // scroll content to bottom
          bar.css({ top: me.outerHeight() - bar.outerHeight() });
          scrollContent(0, true);
        }
        else if (typeof start == 'object')
        {
          // scroll content
          scrollContent($(start).position().top, null, true);

          // make sure bar stays hidden
          if (!alwaysVisible) { bar.hide(); }
        }
      });
      
      // maintain chainability
      return this;
    }
  });

  jQuery.fn.extend({
    slimscroll: jQuery.fn.slimScroll
  });

})(jQuery);;
  var Graph, Link, Node, Quaternion, SNode, SphericalCoords, aiChatAddLine, aiChatButtonPressed, aiChatReply, aiChatSubmit, aiChatVisible, autoUpdateUsername, checkEmail, checkEmailReply, checkUsername, checkUsernameReply, clearLoginErrors, clearSignupErrors, dotProduct, dragging, emailChanged, emailStatus, frand, fullBind, g, getCoulombEnergy, getForces, hideAiChat, hideAlert, initAiChat, initAlert, initGraph, initInterface, initLoginDialog, initRemoveDialog, initSearchDialog, initSignUpDialog, interRect, lastScale, lastX, lastY, layout, lineRectOverlap, lineSegsOverlap, login, loginReply, logout, m4x4mulv3, mouseDown, mouseMove, mouseUp, mouseWheel, newv3, nodeClicked, nodeCount, nodeView, pointInTriangle, rectsDist, rectsDist2, rectsOverlap, removeAction, removeButtonPressed, removeInfoMessage, removeMode, resultsReceived, rotRectsOverlap, rotateAndTranslate, scroll, scrollOff, scrollOn, searchQuery, searchRequest, sepAxis, sepAxisSide, setErrorAlert, setInfoAlert, showAiChat, showLoginDialog, showRemoveDialog, showSearchDialog, showSignUpDialog, signup, signupReply, submitting, tmpVec, touchEnd, touchMove, touchStart, updateUsername, usernameChanged, usernameStatus, v3diffLength, v3dotv3, v3length;

  rotateAndTranslate = function(point, angle, tx, ty) {
    var rx, ry, x, y;
    x = point[0];
    y = point[1];
    rx = Math.cos(angle) * x - Math.sin(angle) * y;
    ry = Math.sin(angle) * x + Math.cos(angle) * y;
    x = rx + tx;
    y = ry + ty;
    point[0] = x;
    return point[1] = y;
  };

  dotProduct = function(p0, p1) {
    return (p0[0] * p1[0]) + (p0[1] * p1[1]);
  };

  pointInTriangle = function(A, B, C, P) {
    var dot00, dot01, dot02, dot11, dot12, invDenom, u, v, v0, v1, v2;
    v0 = [0, 0];
    v1 = [0, 0];
    v2 = [0, 0];
    v0[0] = C[0] - A[0];
    v0[1] = C[1] - A[1];
    v1[0] = B[0] - A[0];
    v1[1] = B[1] - A[1];
    v2[0] = P[0] - A[0];
    v2[1] = P[1] - A[1];
    dot00 = dotProduct(v0, v0);
    dot01 = dotProduct(v0, v1);
    dot02 = dotProduct(v0, v2);
    dot11 = dotProduct(v1, v1);
    dot12 = dotProduct(v1, v2);
    invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
    u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    v = (dot00 * dot12 - dot01 * dot02) * invDenom;
    return (u > 0) && (v > 0) && (u + v < 1);
  };

  /*
  Return the intersection point between the line segment defined by (x1, y1) and (x2, y2)
  and a rectangle defined by (rleft, rtop, rright, rbottom)
  
  (x1, y1) is assumed to be inside the rectangle and (x2, y2) outside
  */

  interRect = function(x1, y1, x2, y2, rleft, rtop, rright, rbottom) {
    var dx, dy, edge, ix, iy, t, tx, ty;
    dx = x2 - x1;
    dy = y2 - y1;
    t = tx = ty = 0;
    if ((dx === 0) && (dy === 0)) return 0;
    if (dx !== 0) {
      if (dx > 0) {
        edge = rright;
      } else {
        edge = rleft;
      }
      tx = (edge - x1) / dx;
    }
    if (dy !== 0) {
      if (dy > 0) {
        edge = rbottom;
      } else {
        edge = rtop;
      }
      ty = (edge - y1) / dy;
    }
    if (dx === 0) {
      t = ty;
    } else if (dy === 0) {
      t = tx;
    } else {
      if (tx < ty) {
        t = tx;
      } else {
        t = ty;
      }
    }
    ix = x1 + dx * t;
    iy = y1 + dy * t;
    return [ix, iy];
  };

  rectsOverlap = function(r1_x1, r1_y1, r1_x2, r1_y2, r2_x1, r2_y1, r2_x2, r2_y2) {
    if (r1_x1 < r2_x2 && r1_x2 > r2_x1 && r1_y1 < r2_y2 && r1_y2 > r2_y1) {
      return true;
    }
    return false;
  };

  sepAxisSide = function(a1, a2, point) {
    var dp;
    dp = ((a2.x - a1.x) * (point.y - a1.y)) - ((a2.y - a1.y) * (point.x - a1.x));
    if (dp < 0) {
      return -1;
    } else {
      return 1;
    }
  };

  sepAxis = function(a1, a2, point, rect) {
    var sign1, sign2;
    sign1 = sepAxisSide(a1, a2, point);
    sign2 = sepAxisSide(a1, a2, rect.v1);
    if (sign1 === sign2) return false;
    if (sign2 !== sepAxisSide(a1, a2, rect.v2)) return false;
    if (sign2 !== sepAxisSide(a1, a2, rect.v3)) return false;
    if (sign2 !== sepAxisSide(a1, a2, rect.v4)) return false;
    return true;
  };

  rotRectsOverlap = function(rect1, rect2) {
    if (sepAxis(rect1.v1, rect1.v2, rect1.v3, rect2)) return false;
    if (sepAxis(rect1.v2, rect1.v3, rect1.v1, rect2)) return false;
    if (sepAxis(rect1.v3, rect1.v4, rect1.v1, rect2)) return false;
    if (sepAxis(rect1.v4, rect1.v1, rect1.v2, rect2)) return false;
    if (sepAxis(rect2.v1, rect2.v2, rect2.v3, rect1)) return false;
    if (sepAxis(rect2.v2, rect2.v3, rect2.v1, rect1)) return false;
    if (sepAxis(rect2.v3, rect2.v4, rect2.v1, rect1)) return false;
    if (sepAxis(rect2.v4, rect2.v1, rect2.v2, rect1)) return false;
    return true;
  };

  rectsDist2 = function(r1_x1, r1_y1, r1_x2, r1_y2, r2_x1, r2_y1, r2_x2, r2_y2) {
    var c1_x, c1_y, c2_x, c2_y, deltaX, deltaY, p1, p2;
    if (rectsOverlap(r1_x1, r1_y1, r1_x2, r1_y2, r2_x1, r2_y1, r2_x2, r2_y2)) {
      return 0;
    }
    c1_x = r1_x1 + ((r1_x2 - r1_x1) / 2);
    c1_y = r1_y1 + ((r1_y2 - r1_y1) / 2);
    c2_x = r2_x1 + ((r2_x2 - r2_x1) / 2);
    c2_y = r2_y1 + ((r2_y2 - r2_y1) / 2);
    p1 = interRect(c1_x, c1_y, c2_x, c2_y, r1_x1, r1_y1, r1_x2, r1_y2);
    p2 = interRect(c2_x, c2_y, c1_x, c1_y, r2_x1, r2_y1, r2_x2, r2_y2);
    deltaX = p1[0] - p2[0];
    deltaY = p1[1] - p2[1];
    return (deltaX * deltaX) + (deltaY * deltaY);
  };

  rectsDist = function(r1_x1, r1_y1, r1_x2, r1_y2, r2_x1, r2_y1, r2_x2, r2_y2) {
    var dist;
    dist = rectsDist2(r1_x1, r1_y1, r1_x2, r1_y2, r2_x1, r2_y1, r2_x2, r2_y2);
    return Math.sqrt(dist);
  };

  lineSegsOverlap = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    var denom, ua, ub;
    denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
    ua = (x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3);
    ub = (x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3);
    if (denom === 0) {
      if ((ua === 0) && (ub === 0)) {
        return true;
      } else {
        return false;
      }
    }
    ua /= denom;
    ub /= denom;
    if ((ua >= 0) && (ua <= 1) && (ub >= 0) && (ub <= 1)) {
      return true;
    } else {
      return false;
    }
  };

  lineRectOverlap = function(x1, y1, x2, y2, rect) {
    if (lineSegsOverlap(x1, y1, x2, y2, rect.v1.x, rect.v1.y, rect.v2.x, rect.v2.y)) {
      return true;
    }
    if (lineSegsOverlap(x1, y1, x2, y2, rect.v2.x, rect.v2.y, rect.v3.x, rect.v3.y)) {
      return true;
    }
    if (lineSegsOverlap(x1, y1, x2, y2, rect.v3.x, rect.v3.y, rect.v4.x, rect.v4.y)) {
      return true;
    }
    if (lineSegsOverlap(x1, y1, x2, y2, rect.v4.x, rect.v4.y, rect.v1.x, rect.v1.y)) {
      return true;
    }
    return false;
  };

  /*
  Collection of linear algebra functions for vectors with 3 elements and 4x4 matrices.
  Useful for 3D calculations.
  */

  tmpVec = new Array(3);

  newv3 = function() {
    return new Array(3);
  };

  /*
  Caluculates the dot product of a and b,
  where a and b are vectors with 3 elements.
  */

  v3dotv3 = function(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
  };

  v3length = function(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  };

  v3diffLength = function(v1, v2) {
    var v;
    v = newv3();
    v[0] = v2[0] - v1[0];
    v[1] = v2[1] - v1[1];
    v[2] = v2[2] - v1[2];
    return v3length(v);
  };

  /*
  r = m * v
  
  m: 4x4 matrix
  v: vector with 3 elements
  r: vetor with 3 elements to store results
  */

  m4x4mulv3 = function(m, v, r) {
    var w;
    tmpVec[0] = m[3];
    tmpVec[1] = m[7];
    tmpVec[2] = m[11];
    w = v3dotv3(v, tmpVec) + m[15];
    tmpVec[0] = m[0];
    tmpVec[1] = m[4];
    tmpVec[2] = m[8];
    r[0] = (v3dotv3(v, tmpVec) + m[12]) / w;
    tmpVec[0] = m[1];
    tmpVec[1] = m[5];
    tmpVec[2] = m[9];
    r[1] = (v3dotv3(v, tmpVec) + m[13]) / w;
    tmpVec[0] = m[2];
    tmpVec[1] = m[6];
    tmpVec[2] = m[10];
    return r[2] = (v3dotv3(v, tmpVec) + m[14]) / w;
  };

  /*
  This class implements certain aspects of quaternion arithmetic
  necessary to perfrom 3D rotations without gimbal lock.
  More info: http://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation
  */

  Quaternion = (function() {

    function Quaternion() {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 1;
    }

    Quaternion.prototype.fromEuler = function(pitch, yaw, roll) {
      var cosp, cosr, cosy, sinp, sinr, siny;
      sinp = Math.sin(pitch);
      siny = Math.sin(yaw);
      sinr = Math.sin(roll);
      cosp = Math.cos(pitch);
      cosy = Math.cos(yaw);
      cosr = Math.cos(roll);
      this.x = sinr * cosp * cosy - cosr * sinp * siny;
      this.y = cosr * sinp * cosy + sinr * cosp * siny;
      this.z = cosr * cosp * siny - sinr * sinp * cosy;
      this.w = cosr * cosp * cosy + sinr * sinp * siny;
      return this.normalise();
    };

    /*
        Normalise the quaternion so that it's length is 1
        Does not do anything if current length is within a certain tolerance
    */

    Quaternion.prototype.normalise = function() {
      var TOLERANCE, l;
      TOLERANCE = 0.00001;
      l = (this.x * this.x) + (this.y * this.y) + (this.z * this.z) + (this.w * this.w);
      if (Math.abs(l - 1) > TOLERANCE) {
        l = Math.sqrt(l);
        this.x /= l;
        this.y /= l;
        this.z /= l;
        return this.w /= l;
      }
    };

    /*
        Multiply quaternion q by this and store result in this
        (this = q * this)
        Purpose:
        Changes rotation represented by this by rotation represented by q
    */

    Quaternion.prototype.mul = function(q) {
      var _w, _x, _y, _z;
      _x = (this.w * q.x) + (this.x * q.w) + (this.y * q.z) - (this.z * q.y);
      _y = (this.w * q.y) - (this.x * q.z) + (this.y * q.w) + (this.z * q.x);
      _z = (this.w * q.z) + (this.x * q.y) - (this.y * q.x) + (this.z * q.w);
      _w = (this.w * q.w) - (this.x * q.x) - (this.y * q.y) - (this.z * q.z);
      this.x = _x;
      this.y = _y;
      this.z = _z;
      return this.w = _w;
    };

    /*
        Creates affine transformation matrix for the rotation represented by
        this quaternion.
        Matrix is written to the array with length 16 that must be provided as parameter.
        (for eficiency, avoid unnecesssary creation and destruction of arrays)
    */

    Quaternion.prototype.getMatrix = function(m) {
      var wx, wy, wz, x2, xy, xz, y2, yz, z2;
      x2 = this.x * this.x;
      y2 = this.y * this.y;
      z2 = this.z * this.z;
      xy = this.x * this.y;
      xz = this.x * this.z;
      yz = this.y * this.z;
      wx = this.w * this.x;
      wy = this.w * this.y;
      wz = this.w * this.z;
      m[0] = 1 - (2 * (y2 + z2));
      m[1] = 2 * (xy - wz);
      m[2] = 2 * (xz + wy);
      m[3] = 0;
      m[4] = 2 * (xy + wz);
      m[5] = 1 - (2 * (x2 + z2));
      m[6] = 2 * (yz - wx);
      m[7] = 0;
      m[8] = 2 * (xz - wy);
      m[9] = 2 * (yz + wx);
      m[10] = 1 - (2 * (x2 + y2));
      m[11] = 0;
      m[12] = 0;
      m[13] = 0;
      m[14] = 0;
      return m[15] = 1;
    };

    return Quaternion;

  })();

  initAlert = function() {
    $('#alert').css('display', 'none');
    return $('#alert').css('visibility', 'visible');
  };

  setInfoAlert = function(msg) {
    $('#alert').css('display', 'block');
    $('#alert').removeClass('alert-error');
    $('#alert').addClass('alert-info');
    return $('#alertMsg').html(msg);
  };

  setErrorAlert = function(msg) {
    $('#alert').css('display', 'block');
    $('#alert').removeClass('alert-info');
    $('#alert').addClass('alert-error');
    return $('#alertMsg').html(msg);
  };

  hideAlert = function() {
    return $('#alert').css('display', 'none');
  };

  dragging = false;

  lastX = 0;

  lastY = 0;

  lastScale = -1;

  scroll = false;

  scrollOn = function(e) {
    return scroll = true;
  };

  scrollOff = function(e) {
    return scroll = false;
  };

  mouseUp = function(e) {
    dragging = false;
    return false;
  };

  mouseDown = function(e) {
    dragging = true;
    lastX = e.pageX;
    lastY = e.pageY;
    return false;
  };

  mouseMove = function(e) {
    var deltaX, deltaY;
    if (dragging) {
      deltaX = e.pageX - lastX;
      deltaY = e.pageY - lastY;
      lastX = e.pageX;
      lastY = e.pageY;
      g.rotateX(-deltaX * 0.0015);
      g.rotateY(deltaY * 0.0015);
      g.updateView();
      g.updateDetailLevel();
    }
    return false;
  };

  touchStart = function(e) {
    var touch;
    if (e.touches.length === 1) {
      touch = e.touches[0];
      lastX = touch.pageX;
      lastY = touch.pageY;
    }
    return true;
  };

  touchEnd = function(e) {
    lastScale = -1;
    return true;
  };

  touchMove = function(e) {
    var deltaScale, deltaX, deltaY, dx, dy, scale, touch, x, y;
    if (e.touches.length === 1) {
      e.preventDefault();
      touch = e.touches[0];
      deltaX = touch.pageX - lastX;
      deltaY = touch.pageY - lastY;
      lastX = touch.pageX;
      lastY = touch.pageY;
      g.rotateX(-deltaX * 0.0015);
      g.rotateY(deltaY * 0.0015);
      g.updateView();
      g.updateDetailLevel();
      false;
    } else if (e.touches.length === 2) {
      e.preventDefault();
      dx = e.touches[0].pageX - e.touches[1].pageX;
      dy = e.touches[0].pageY - e.touches[1].pageY;
      scale = Math.sqrt(dx * dx + dy * dy);
      if (lastScale >= 0) {
        x = (e.touches[0].pageX + e.touches[1].pageX) / 2;
        y = (e.touches[0].pageY + e.touches[1].pageY) / 2;
        deltaScale = (scale - lastScale) * 0.025;
        g.zoom(deltaScale, x, y);
      }
      lastScale = scale;
      false;
    }
    return true;
  };

  mouseWheel = function(e, delta, deltaX, deltaY) {
    if (!scroll) g.zoom(deltaY, e.pageX, e.pageY);
    return true;
  };

  fullBind = function(eventName, f) {
    $("#graphDiv").bind(eventName, f);
    $(".snode1").bind(eventName, f);
    $(".snodeN").bind(eventName, f);
    return $(".link").bind(eventName, f);
  };

  initInterface = function() {
    $('#search-field').submit(searchQuery);
    initSearchDialog();
    initSignUpDialog();
    initLoginDialog();
    $('.signupLink').bind('click', showSignUpDialog);
    $('#loginLink').bind('click', showLoginDialog);
    $('#logoutLink').bind('click', logout);
    if (nodeView) {
      fullBind("mouseup", mouseUp);
      fullBind("mousedown", mouseDown);
      fullBind("mousemove", mouseMove);
      fullBind("mousewheel", mouseWheel);
      document.addEventListener('touchstart', touchStart);
      document.addEventListener('touchend', touchEnd);
      document.addEventListener('touchmove', touchMove);
      initAlert();
      initAiChat();
      initRemoveDialog();
      $('#ai-chat-button').bind('click', aiChatButtonPressed);
      $('#removeButton').bind('click', removeButtonPressed);
      if (errorMsg !== '') return setErrorAlert(errorMsg);
    }
  };

  nodeCount = 0;

  function getHostname(url) {
    var m = ((url||'')+'').match(/^http:\/\/([^/]+)/);
    return m ? m[1] : null;
};

  nodeClicked = function(msg) {
    if (removeMode) {
      showRemoveDialog(msg.data.node, msg.data.orig, msg.data.link, msg.data.targ);
      return false;
    } else {
      return true;
    }
  };

  Node = (function() {

    function Node(id, text, type, snode, url) {
      this.id = id;
      this.text = text;
      this.type = type;
      this.snode = snode;
      this.url = url != null ? url : '';
      this.divid = 'n' + nodeCount++;
      this.rpos = Array(3);
      this.subNodes = [];
      this.sx = 0;
      this.sy = 0;
      this.dlevel = 0;
    }

    Node.prototype.estimatePos = function() {
      this.rpos[0] = this.snode.rpos[0] + this.sx;
      this.rpos[1] = this.snode.rpos[1] + this.sy;
      this.rpos[2] = this.snode.rpos[2];
      this.x0 = this.rpos[0] - this.halfWidth;
      this.y0 = this.rpos[1] - this.halfHeight;
      this.x1 = this.rpos[0] + this.halfWidth;
      return this.y1 = this.rpos[1] + this.halfHeight;
    };

    Node.prototype.updateDimensions = function() {
      var nodeDiv;
      nodeDiv = $('#' + this.divid);
      this.width = nodeDiv.outerWidth();
      this.height = nodeDiv.outerHeight();
      this.halfWidth = this.width / 2;
      return this.halfHeight = this.height / 2;
    };

    Node.prototype.place = function() {
      var html, nodeData;
      $('#' + this.snode.id + ' .viewport').append('<div id="' + this.divid + '" class="node" />');
      nodeData = {};
      if (this.snode.linkDirection === 'in') {
        nodeData = {
          'node': this.id,
          'orig': rootNodeId,
          'link': this.snode.linkLabel,
          'targ': this.id
        };
      } else {
        nodeData = {
          'node': this.id,
          'targ': rootNodeId,
          'link': this.snode.linkLabel,
          'orig': this.id
        };
      }
      if (this.type === 'url') {
        html = '<div class="nodeTitle" id="t' + this.divid + '"><a href="/node/' + this.id + '" id="' + this.divid + '">' + this.text + '</a></div>';
        html += '<div><img src="http://www.google.com/s2/u/0/favicons?domain=' + getHostname(this.url) + '" class="nodeIco" /><div class="nodeUrl"><a href="' + this.url + '" id="url' + this.divid + '">' + this.url + '</a></div></div>';
        $('#' + this.divid).append(html);
        $('#url' + this.divid).click(nodeData, nodeClicked);
      } else {
        html = '<div class="nodeTitle" id="t' + this.divid + '"><a href="/node/' + this.id + '" id="' + this.divid + '">' + this.text + '</a></div>';
        $('#' + this.divid).append(html);
      }
      $('#t' + this.divid).click(nodeData, nodeClicked);
      html = '<div id="d' + this.divid + '" class="nodeDetail">Some more text about this node.</div>';
      $('#' + this.divid).append(html);
      return this.updateDimensions();
    };

    Node.prototype.updateDetailLevel = function(scale, z, depth) {
      var k, _dlevel;
      k = scale * (z + 500);
      _dlevel = 1;
      if (k < 99999999) _dlevel = 0;
      if (_dlevel === this.dlevel) return false;
      this.dlevel = _dlevel;
      if (this.dlevel === 0) {
        $('div#' + this.divid).css('font-size', '12px');
        $('div#d' + this.divid).css('display', 'none');
      } else if (this.dlevel === 1) {
        $('div#' + this.divid).css('font-size', '24px');
        $('div#d' + this.divid).css('display', 'block');
      }
      return true;
    };

    return Node;

  })();

  SphericalCoords = (function() {

    function SphericalCoords() {
      this.theta = 0;
      this.phi = 0;
      this.r = 0;
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    SphericalCoords.prototype.sphericalToCartesian = function() {
      var phi, theta;
      if (this.r === 0) {
        this.x = 0;
        this.y = 0;
        return this.z = 0;
      } else {
        theta = this.theta + (Math.PI / 2);
        phi = this.phi + (Math.PI / 2);
        this.x = this.r * Math.cos(theta) * Math.sin(phi);
        this.y = this.r * Math.cos(phi);
        this.z = this.r * Math.sin(theta) * Math.sin(phi);
        if (this.z < 0) return this.z *= g.negativeStretch;
      }
    };

    SphericalCoords.prototype.cartesianToSpherical = function() {
      this.r = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
      this.theta = Math.atan2(this.z, this.x) - (Math.PI / 2);
      if (this.theta < -Math.PI) this.theta += 2 * Math.PI;
      return this.phi = Math.acos(this.y / this.r) - (Math.PI / 2);
    };

    SphericalCoords.prototype.scoordMapping = function(ang, maxAng) {
      var d, _maxAng;
      _maxAng = maxAng;
      if (ang < 0) _maxAng = -maxAng;
      d = Math.abs((_maxAng - ang) / maxAng);
      d = Math.abs(Math.pow(d, g.mappingPower));
      d *= _maxAng;
      return _maxAng - d;
    };

    SphericalCoords.prototype.viewMapping = function() {
      this.theta = this.scoordMapping(this.theta, Math.PI);
      return this.phi = this.scoordMapping(this.phi, Math.PI / 2);
    };

    return SphericalCoords;

  })();

  SNode = (function() {

    function SNode(id) {
      this.id = id;
      this.pos = newv3();
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.rpos = Array(3);
      this.auxVec = new Array(3);
      this.f = newv3();
      this.tpos = newv3();
      this.nodes = {};
      this.subNodes = [];
      this.parent = 'unknown';
      this.links = [];
      this.weight = 0;
      this.depth = 0;
      this.width = 0;
      this.height = 0;
      this.halfWidth = 0;
      this.halfHeight = 0;
      this.initialWidth = -1;
      this.scale = 1;
      this.rect = [];
      this.rect.v1 = [];
      this.rect.v2 = [];
      this.rect.v3 = [];
      this.rect.v4 = [];
      this.rect.v1.x = 0;
      this.rect.v1.y = 0;
      this.rect.v1.z = 0;
      this.rect.v2.x = 0;
      this.rect.v2.y = 0;
      this.rect.v2.z = 0;
      this.rect.v3.x = 0;
      this.rect.v3.y = 0;
      this.rect.v3.z = 0;
      this.rect.v4.x = 0;
      this.rect.v4.y = 0;
      this.rect.v4.z = 0;
      this.jqDiv = false;
      this.linkLabel = "";
    }

    SNode.prototype.updateTransform = function() {
      var opacity, transformStr, x, y, z;
      x = this.rpos[0];
      y = this.rpos[1];
      z = this.rpos[2] + g.zOffset;
      if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
        transformStr = 'translate3d(' + (x - this.halfWidth) + 'px,' + (y - this.halfHeight) + 'px,' + z + 'px)';
        transformStr += ' scale(' + this.scale + ')';
        this.jqDiv.css('-webkit-transform', transformStr);
        this.jqDiv.css('-moz-transform', transformStr);
        if (z < 0) {
          opacity = -1 / (z * 0.007);
          return this.jqDiv.css('opacity', opacity);
        } else {
          return this.jqDiv.css('opacity', 1);
        }
      }
    };

    SNode.prototype.moveTo = function(x, y, z) {
      var sc;
      this.x = x;
      this.y = y;
      this.z = z;
      this.auxVec[0] = this.x;
      this.auxVec[1] = this.y;
      this.auxVec[2] = this.z;
      m4x4mulv3(g.affinMat, this.auxVec, this.rpos);
      sc = new SphericalCoords;
      sc.x = this.rpos[0];
      sc.y = this.rpos[1];
      sc.z = this.rpos[2];
      sc.cartesianToSpherical();
      sc.viewMapping();
      sc.sphericalToCartesian();
      this.rpos[0] = sc.x;
      this.rpos[1] = sc.y;
      this.rpos[2] = sc.z;
      this.rpos[0] = this.rpos[0] * g.halfWidth * 0.8 + g.halfWidth;
      this.rpos[1] += this.rpos[1] * g.halfHeight * 0.8 + g.halfHeight;
      this.rpos[2] += this.rpos[2] * Math.min(g.halfWidth, g.halfHeight) * 0.8;
      this.x0 = this.rpos[0] - this.halfWidth;
      this.y0 = this.rpos[1] - this.halfHeight;
      this.x1 = this.rpos[0] + this.halfWidth;
      this.y1 = this.rpos[1] + this.halfHeight;
      this.rect.v1.x = this.rpos[0] - this.halfWidth;
      this.rect.v1.y = this.rpos[1] - this.halfHeight;
      this.rect.v2.x = this.rpos[0] - this.halfWidth;
      this.rect.v2.y = this.rpos[1] + this.halfHeight;
      this.rect.v3.x = this.rpos[0] + this.halfWidth;
      this.rect.v3.y = this.rpos[1] + this.halfHeight;
      this.rect.v4.x = this.rpos[0] + this.halfWidth;
      this.rect.v4.y = this.rpos[1] - this.halfHeight;
      return this.updateTransform();
    };

    SNode.prototype.applyPos = function() {
      return this.moveTo(this.pos[0], this.pos[1], this.pos[2]);
    };

    SNode.prototype.updateDimensions = function() {
      this.width = this.jqDiv.outerWidth();
      this.height = this.jqDiv.outerHeight();
      this.halfWidth = this.width / 2;
      this.halfHeight = this.height / 2;
      if (this.initialWidth < 0) this.initialWidth = this.width;
      return this.updateTransform();
    };

    SNode.prototype.place = function() {
      var html, key, nodeObj, nodesCount;
      html = '<div id="' + this.id + '"><div class="viewport" /></div>';
      $('#nodesDiv').append(html);
      this.jqDiv = $('#' + this.id);
      nodesCount = 0;
      for (key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) nodesCount++;
      }
      if (nodesCount > 1) {
        this.jqDiv.addClass('snodeN');
      } else {
        this.jqDiv.addClass('snode1');
      }
      for (key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) this.nodes[key].place();
      }
      if ((nodesCount > 1) && (this.jqDiv.outerHeight() > 250)) {
        $('#' + this.id + ' .viewport').slimScroll({
          height: '250px'
        });
        this.jqDiv.hover(scrollOn, scrollOff);
      }
      this.updateDimensions();
      return nodeObj = this;
    };

    SNode.prototype.updateDetailLevel = function(scale) {
      var key, updated;
      updated = false;
      for (key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) {
          if (this.nodes[key].updateDetailLevel(scale, this.rpos[2], this.depth)) {
            updated = true;
          }
        }
      }
      if (updated) {
        this.updateDimensions();
        this.scale = this.initialWidth / this.width;
        return this.updateTransform();
      }
    };

    SNode.prototype.toString = function() {
      var key;
      for (key in this.nodes) {
        if (this.nodes.hasOwnProperty(key)) {
          return '{' + this.nodes[key].text + ', ...}';
        }
      }
    };

    return SNode;

  })();

  Link = (function() {

    function Link(id, orig, sorig, targ, starg, label, color) {
      this.id = id;
      this.orig = orig;
      this.sorig = sorig;
      this.targ = targ;
      this.starg = starg;
      this.label = label;
      this.color = color;
      this.ox = 0;
      this.oy = 0;
      this.tx = 0;
      this.ty = 0;
      this.len = 0;
      this.jqLabel = false;
    }

    Link.prototype.updatePos = function() {
      var origSuper, p0, p1, slope, targSuper, x0, x1, y0, y1, _dx, _dy, _orig, _targ;
      _orig = false;
      _targ = false;
      origSuper = false;
      targSuper = false;
      if (this.orig) {
        _orig = this.orig;
      } else if (this.sorig) {
        _orig = this.sorig;
        this.origSuper = true;
      }
      if (this.targ) {
        _targ = this.targ;
      } else if (this.starg) {
        _targ = this.starg;
        this.targSuper = true;
      }
      x0 = _orig.rpos[0];
      y0 = _orig.rpos[1];
      x1 = _targ.rpos[0];
      y1 = _targ.rpos[1];
      p0 = interRect(x0, y0, x1, y1, _orig.x0, _orig.y0, _orig.x1, _orig.y1);
      p1 = interRect(x1, y1, x0, y0, _targ.x0, _targ.y0, _targ.x1, _targ.y1);
      this.x0 = p0[0];
      this.y0 = p0[1];
      this.z0 = _orig.rpos[2];
      this.x1 = p1[0];
      this.y1 = p1[1];
      this.z1 = _targ.rpos[2];
      _dx = this.x1 - this.x0;
      _dy = this.y1 - this.y0;
      this.dx = _dx;
      this.dy = _dy;
      this.len = (_dx * _dx) + (_dy * _dy);
      this.len = Math.sqrt(this.len);
      this.cx = this.x0 + ((this.x1 - this.x0) / 2);
      this.cy = this.y0 + ((this.y1 - this.y0) / 2);
      slope = (this.y1 - this.y0) / (this.x1 - this.x0);
      return this.angle = Math.atan(slope);
    };

    Link.prototype.place = function() {
      var height, labelWidth, snode;
      $('#nodesDiv').append('<div class="linkLabel" id="linkLabel' + this.id + '"><div class="linkText" id="linkText' + this.id + '">' + this.label + '</div><div class="linkArrow" id="linkArrow' + this.id + '" /></div>');
      $('#nodesDiv').append('<div class="linkPoint" id="linkPoint1' + this.id + '"></div>');
      $('#nodesDiv').append('<div class="linkPoint" id="linkPoint2' + this.id + '"></div>');
      $('#nodesDiv').append('<div class="linkPoint" id="linkPoint3' + this.id + '"></div>');
      $('#nodesDiv').append('<div class="linkPoint" id="linkPoint4' + this.id + '"></div>');
      $('#linkText' + this.id).css('background', this.color);
      $('#linkArrow' + this.id).css('border-left', '11px solid ' + this.color);
      $('#linkPoint1' + this.id).css('background', this.color);
      $('#linkPoint2' + this.id).css('background', this.color);
      $('#linkPoint3' + this.id).css('background', this.color);
      $('#linkPoint4' + this.id).css('background', this.color);
      snode = this.starg;
      if (snode === g.root) snode = this.sorig;
      snode.jqDiv.css('border-color', this.color);
      this.jqLabel = $('#linkLabel' + this.id);
      height = this.jqLabel.outerHeight();
      this.halfHeight = height / 2;
      labelWidth = this.jqLabel.outerWidth();
      return this.halfLabelWidth = labelWidth / 2;
    };

    Link.prototype.updatePoint = function(pointId, pos) {
      var deltaX, deltaY, deltaZ, transformStr, tx, ty, tz;
      deltaX = this.x1 - this.x0;
      deltaY = this.y1 - this.y0;
      deltaZ = this.z1 - this.z0;
      tx = this.x0 + deltaX * pos;
      ty = this.y0 + deltaY * pos;
      tz = this.z0 + deltaZ * pos;
      tx -= 1.5;
      ty -= 1.5;
      transformStr = 'translate3d(' + tx + 'px,' + ty + 'px,' + tz + 'px)';
      $(pointId).css('-webkit-transform', transformStr);
      return $(pointId).css('-moz-transform', transformStr);
    };

    Link.prototype.visualUpdate = function() {
      var cx, cy, cz, deltaX, deltaY, deltaZ, len, opacity, roty, rotz, transformStr, tx, ty, tz, z;
      deltaX = this.x1 - this.x0;
      deltaY = this.y1 - this.y0;
      deltaZ = this.z1 - this.z0;
      cx = this.x0 + (deltaX / 2);
      cy = this.y0 + (deltaY / 2);
      cz = this.z0 + (deltaZ / 2);
      len = Math.sqrt((deltaX * deltaX) + (deltaY * deltaY) + (deltaZ * deltaZ));
      rotz = Math.atan2(deltaY, deltaX);
      roty = 0;
      if (deltaX >= 0) {
        roty = -Math.atan2(deltaZ * Math.cos(rotz), deltaX);
      } else {
        roty = Math.atan2(deltaZ * Math.cos(rotz), -deltaX);
      }
      this.jqLabel.css('left', '' + ((len / 2) - this.halfLabelWidth) + 'px');
      tx = cx - (len / 2);
      ty = cy - this.halfHeight;
      tz = cz + g.zOffset;
      transformStr = 'translate3d(' + tx + 'px,' + ty + 'px,' + tz + 'px)' + ' rotateZ(' + rotz + 'rad)' + ' rotateY(' + roty + 'rad)';
      this.jqLabel.css('-webkit-transform', transformStr);
      this.jqLabel.css('-moz-transform', transformStr);
      this.updatePoint('#linkPoint1' + this.id, 0.1);
      this.updatePoint('#linkPoint2' + this.id, 0.2);
      this.updatePoint('#linkPoint3' + this.id, 0.8);
      this.updatePoint('#linkPoint4' + this.id, 0.9);
      z = cz;
      if (z < 0) {
        opacity = -1 / (z * 0.007);
        this.jqLabel.css('opacity', opacity);
        $('#linkPoint1' + this.id).css('opacity', opacity);
        $('#linkPoint2' + this.id).css('opacity', opacity);
        $('#linkPoint3' + this.id).css('opacity', opacity);
        return $('#linkPoint4' + this.id).css('opacity', opacity);
      } else {
        this.jqLabel.css('opacity', 0.9);
        $('#linkPoint1' + this.id).css('opacity', 0.7);
        $('#linkPoint2' + this.id).css('opacity', 0.7);
        $('#linkPoint3' + this.id).css('opacity', 0.7);
        return $('#linkPoint4' + this.id).css('opacity', 0.7);
      }
    };

    return Link;

  })();

  frand = function() {
    return Math.random() - 0.5;
  };

  getCoulombEnergy = function() {
    var N, e, i, j, _ref, _ref2, _ref3;
    e = 0;
    N = g.snodeArray.length;
    for (i = 0, _ref = N - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      if (i < N - 1) {
        for (j = _ref2 = i + 1, _ref3 = N - 1; _ref2 <= _ref3 ? j <= _ref3 : j >= _ref3; _ref2 <= _ref3 ? j++ : j--) {
          e += 1 / v3diffLength(g.snodeArray[i].tpos, g.snodeArray[j].tpos);
        }
      }
    }
    return e;
  };

  getForces = function() {
    var N, ff, i, j, l, posi, posj, r, _ref, _ref2, _results;
    N = g.snodeArray.length;
    r = newv3;
    for (i = 0, _ref = N - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      g.snodeArray[i].f[0] = 0;
      g.snodeArray[i].f[1] = 0;
      g.snodeArray[i].f[2] = 0;
    }
    _results = [];
    for (i = 0, _ref2 = N - 1; 0 <= _ref2 ? i <= _ref2 : i >= _ref2; 0 <= _ref2 ? i++ : i--) {
      posi = g.snodeArray[i].pos;
      if (i < N - 1) {
        _results.push((function() {
          var _ref3, _ref4, _results2;
          _results2 = [];
          for (j = _ref3 = i + 1, _ref4 = N - 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
            posj = g.snodeArray[j].pos;
            r[0] = posi[0] - posj[0];
            r[1] = posi[1] - posj[1];
            r[2] = posi[2] - posj[2];
            l = v3length(r);
            l = 1 / (l * l * l);
            ff = l * r[0];
            g.snodeArray[i].f[0] += ff;
            g.snodeArray[j].f[0] -= ff;
            ff = l * r[1];
            g.snodeArray[i].f[1] += ff;
            g.snodeArray[j].f[1] -= ff;
            ff = l * r[2];
            g.snodeArray[i].f[2] += ff;
            _results2.push(g.snodeArray[j].f[2] -= ff);
          }
          return _results2;
        })());
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  layout = function() {
    var N, Nstep, d, e, e0, f, i, k, l, minimalStep, pos, step, tpos, _ref, _ref2, _ref3, _ref4;
    N = g.snodeArray.length;
    Nstep = 20;
    step = 0.01;
    minimalStep = 1e-10;
    for (i = 0, _ref = N - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
      g.snodeArray[i].pos[0] = 2 * frand();
      g.snodeArray[i].pos[1] = 2 * frand();
      g.snodeArray[i].pos[2] = 2 * frand();
      l = v3length(g.snodeArray[i].pos);
      if (l !== 0.0) {
        g.snodeArray[i].pos[0] /= l;
        g.snodeArray[i].pos[1] /= l;
        g.snodeArray[i].pos[2] /= l;
        g.snodeArray[i].tpos[0] = g.snodeArray[i].pos[0];
        g.snodeArray[i].tpos[1] = g.snodeArray[i].pos[1];
        g.snodeArray[i].tpos[2] = g.snodeArray[i].pos[2];
      } else {
        i -= 1;
      }
    }
    e0 = getCoulombEnergy();
    for (k = 0, _ref2 = Nstep - 1; 0 <= _ref2 ? k <= _ref2 : k >= _ref2; 0 <= _ref2 ? k++ : k--) {
      getForces();
      for (i = 0, _ref3 = N - 1; 0 <= _ref3 ? i <= _ref3 : i >= _ref3; 0 <= _ref3 ? i++ : i--) {
        f = g.snodeArray[i].f;
        pos = g.snodeArray[i].pos;
        tpos = g.snodeArray[i].tpos;
        d = v3dotv3(f, pos);
        f[0] -= pos[0] * d;
        f[1] -= pos[1] * d;
        f[2] -= pos[2] * d;
        tpos[0] = pos[0] + f[0] * step;
        tpos[1] = pos[1] + f[1] * step;
        tpos[2] = pos[2] + f[2] * step;
        l = v3length(tpos);
        tpos[0] /= l;
        tpos[1] /= l;
        tpos[2] /= l;
      }
      e = getCoulombEnergy();
      if (e >= e0) {
        step /= 2;
        if (step < minimalStep) return;
      } else {
        for (i = 0, _ref4 = N - 1; 0 <= _ref4 ? i <= _ref4 : i >= _ref4; 0 <= _ref4 ? i++ : i--) {
          g.snodeArray[i].pos[0] = g.snodeArray[i].tpos[0];
          g.snodeArray[i].pos[1] = g.snodeArray[i].tpos[1];
          g.snodeArray[i].pos[2] = g.snodeArray[i].tpos[2];
        }
        e0 = e;
        step *= 2;
      }
    }
  };

  g = false;

  initGraph = function() {
    var key, l, link, linkID, nid, nlist, nod, node, orig, parentID, sid, sn, snode, sorig, starg, subNode, targ, text, type, _i, _j, _k, _l, _len, _len2, _len3, _len4, _len5, _m, _ref;
    g = new Graph(window.innerWidth, window.innerHeight);
    g.updateTransform();
    for (_i = 0, _len = snodes.length; _i < _len; _i++) {
      sn = snodes[_i];
      sid = sn['id'];
      nlist = sn['nodes'];
      snode = new SNode(sid);
      for (_j = 0, _len2 = nlist.length; _j < _len2; _j++) {
        nid = nlist[_j];
        nod = nodes[nid];
        text = nod['text'];
        type = nod['type'];
        parentID = nod['parent'];
        node = false;
        if (type === 'url') {
          node = new Node(nid, text, type, snode, nod['url']);
        } else {
          node = new Node(nid, text, type, snode);
        }
        snode.nodes[nid] = node;
        g.nodes[nid] = node;
        if ((snode.parent === 'unknown') || (parentID === '')) {
          snode.parent = parentID;
        }
      }
      g.snodes[sid] = snode;
    }
    for (_k = 0, _len3 = snodes.length; _k < _len3; _k++) {
      sn = snodes[_k];
      sid = sn['id'];
      snode = g.snodes[sid];
      parentID = snode.parent;
      if (parentID === '') {
        g.root = snode;
        snode.parent = false;
      } else {
        snode.parent = g.nodes[parentID].snode;
        g.nodes[parentID].snode.subNodes[g.nodes[parentID].snode.subNodes.length] = snode;
      }
    }
    for (key in g.snodes) {
      if (!(g.snodes.hasOwnProperty(key))) continue;
      snode = g.snodes[key];
      snode.weight = Object.keys(snode.nodes).length;
      if (!snode.parent) {
        snode.depth = 0;
      } else if (snode.parent === g.root) {
        snode.depth = 1;
        _ref = snode.subNodes;
        for (_l = 0, _len4 = _ref.length; _l < _len4; _l++) {
          subNode = _ref[_l];
          snode.weight += subNode.nodes.size();
        }
      } else {
        snode.depth = 2;
      }
    }
    g.genSNodeKeys();
    linkID = 0;
    for (_m = 0, _len5 = links.length; _m < _len5; _m++) {
      l = links[_m];
      orig = '';
      targ = '';
      sorig = '';
      starg = '';
      if ('orig' in l) {
        orig = g.nodes[l['orig']];
        sorig = orig.snode;
      } else {
        orig = false;
        sorig = g.snodes[l['sorig']];
      }
      if ('targ' in l) {
        targ = g.nodes[l['targ']];
        starg = targ.snode;
      } else {
        targ = false;
        starg = g.snodes[l['starg']];
      }
      link = new Link(linkID++, false, sorig, false, starg, l['relation'], l['color']);
      g.links.push(link);
      sorig.links.push(link);
      starg.links.push(link);
      if (sorig.parent === false) {
        starg.linkLabel = l['relation'];
        starg.linkDirection = 'in';
      } else {
        sorig.linkLabel = l['relation'];
        sorig.linkDirection = 'out';
      }
    }
    g.placeNodes();
    g.placeLinks();
    g.layout();
    return g.updateView();
  };

  Graph = (function() {

    function Graph(width, height) {
      this.width = width;
      this.height = height;
      this.halfWidth = width / 2;
      this.halfHeight = height / 2;
      this.snodes = {};
      this.snodeArray = [];
      this.nodes = {};
      this.links = [];
      this.scale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
      this.zOffset = 0;
      this.quat = new Quaternion();
      this.deltaQuat = new Quaternion();
      this.affinMat = new Array(16);
      this.quat.getMatrix(this.affinMat);
      this.negativeStretch = 1;
      this.mappingPower = 1;
    }

    Graph.prototype.updateTransform = function() {
      var transformStr;
      transformStr = "translate(" + this.offsetX + "px," + this.offsetY + "px)" + " scale(" + this.scale + ")";
      $('#nodesDiv').css('-webkit-transform', transformStr);
      return $('#nodesDiv').css('-moz-transform', transformStr);
    };

    Graph.prototype.rotateX = function(angle) {
      this.deltaQuat.fromEuler(angle, 0, 0);
      this.quat.mul(this.deltaQuat);
      this.quat.normalise();
      return this.quat.getMatrix(this.affinMat);
    };

    Graph.prototype.rotateY = function(angle) {
      this.deltaQuat.fromEuler(0, 0, angle);
      this.quat.mul(this.deltaQuat);
      this.quat.normalise();
      return this.quat.getMatrix(this.affinMat);
    };

    Graph.prototype.zoom = function(deltaZoom, x, y) {
      var newScale, r, rx, ry;
      newScale = this.scale + (0.3 * deltaZoom);
      if (newScale < 0.4) newScale = 0.4;
      if (deltaZoom >= 0) {
        rx = x - this.halfWidth;
        this.offsetX = rx - (((rx - this.offsetX) / this.scale) * newScale);
        ry = y - this.halfHeight;
        this.offsetY = ry - (((ry - this.offsetY) / this.scale) * newScale);
      } else {
        if ((this.scale - 0.4) > 0) {
          r = (newScale - 0.4) / (this.scale - 0.4);
          this.offsetX *= r;
          this.offsetY *= r;
        }
      }
      this.scale = newScale;
      this.updateTransform();
      return this.updateDetailLevel();
    };

    Graph.prototype.placeNodes = function() {
      var key, _results;
      _results = [];
      for (key in this.snodes) {
        if (this.snodes.hasOwnProperty(key)) {
          _results.push(this.snodes[key].place());
        }
      }
      return _results;
    };

    Graph.prototype.placeLinks = function() {
      var link, _i, _len, _ref, _results;
      _ref = this.links;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        _results.push(link.place());
      }
      return _results;
    };

    Graph.prototype.updateViewLinks = function() {
      var link, _i, _j, _len, _len2, _ref, _ref2, _results;
      _ref = this.links;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        link.updatePos();
      }
      _ref2 = this.links;
      _results = [];
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        link = _ref2[_j];
        _results.push(link.visualUpdate());
      }
      return _results;
    };

    Graph.prototype.updateView = function() {
      var key, sn;
      for (key in this.snodes) {
        if (!(this.snodes.hasOwnProperty(key))) continue;
        sn = this.snodes[key];
        sn.moveTo(sn.x, sn.y, sn.z);
      }
      return this.updateViewLinks();
    };

    Graph.prototype.updateDetailLevel = function() {
      var key, _results;
      _results = [];
      for (key in this.snodes) {
        if (this.snodes.hasOwnProperty(key)) {
          _results.push(this.snodes[key].updateDetailLevel(this.scale));
        }
      }
      return _results;
    };

    Graph.prototype.genSNodeKeys = function() {
      var key, _i, _len, _ref, _results;
      _ref = this.snodes;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        _results.push(key);
      }
      return _results;
    };

    Graph.prototype.nextByWeight = function(depth) {
      var bestSNode, bestWeight, key, snode;
      bestWeight = -1;
      bestSNode = false;
      for (key in this.snodes) {
        if (!(this.snodes.hasOwnProperty(key))) continue;
        snode = this.snodes[key];
        if ((!snode.fixed) && (snode.depth === depth)) {
          if (snode.weight > bestWeight) {
            bestWeight = snode.weight;
            bestSNode = snode;
          }
        }
      }
      return bestSNode;
    };

    Graph.prototype.signal = function(value) {
      if (value >= 0) {
        return 1.0;
      } else {
        return -1.0;
      }
    };

    Graph.prototype.layout = function() {
      var N, Nt, i, key, _ref, _results;
      for (key in this.snodes) {
        if (this.snodes.hasOwnProperty(key)) this.snodes[key].fixed = false;
      }
      this.root.moveTo(0, 0, 0);
      this.root.fixed = true;
      for (key in this.snodes) {
        if (this.snodes.hasOwnProperty(key) && !this.snodes[key].fixed) {
          this.snodeArray.push(this.snodes[key]);
        }
      }
      layout();
      this.negativeStretch = 1;
      this.mappingPower = 1;
      N = this.snodeArray.length;
      Nt = 7;
      if (N > (Nt * 2)) {
        this.mappingPower = Math.log(Math.asin(Nt / (N / 2)) / Math.PI) * (1 / Math.log(0.5));
        this.negativeStretch = this.mappingPower * 2;
      }
      _results = [];
      for (i = 0, _ref = this.snodeArray.length - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        _results.push(this.snodeArray[i].applyPos());
      }
      return _results;
    };

    Graph.prototype.layout2 = function() {
      var coords, i, key, snode, snodeCount, x, y, z, _ref, _results;
      coords = {
        0: [-0.7, 0, 0],
        1: [0.7, 0, 0],
        2: [0, 0.7, 0],
        3: [0, -0.7, 0],
        4: [-0.5, -0.5, -0.5],
        5: [0.5, 0.5, -0.5],
        6: [-0.5, 0.5, -0.5],
        7: [0.5, -0.5, -0.5],
        8: [-0.5, -0.5, 0.5],
        9: [0.5, 0.5, 0.5],
        10: [-0.5, 0.5, 0.5],
        11: [0.5, -0.5, 0.5]
      };
      for (key in this.snodes) {
        if (this.snodes.hasOwnProperty(key)) this.snodes[key].fixed = false;
      }
      this.root.moveTo(width / 2, height / 2, 0);
      this.root.fixed = true;
      snodeCount = Object.keys(this.snodes).length;
      _results = [];
      for (i = 0, _ref = snodeCount - 1; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        snode = this.nextByWeight(1);
        if (!snode) break;
        x = width / 2;
        y = height / 2;
        z = 0;
        if (i < Object.keys(coords).length) {
          x += coords[i][0] * (width / 2);
          y += coords[i][1] * (height / 2);
          z += coords[i][2] * (height / 2);
        }
        snode.moveTo(x, y, z);
        _results.push(snode.fixed = true);
      }
      return _results;
    };

    return Graph;

  })();

  initSearchDialog = function() {
    var dialogHtml;
    dialogHtml = $("<div class=\"modal hide\" id=\"searchResultsModal\">\n  <div class=\"modal-header\">\n    <a class=\"close\" data-dismiss=\"modal\">×</a>\n    <h3>Search Results</h3>\n  </div>\n  <div class=\"modal-body\" id=\"searchResultsBody\" />\n  <div class=\"modal-footer\">\n    <a class=\"btn btn-primary\" data-dismiss=\"modal\">Close</a>\n  </div>\n</div>");
    dialogHtml.appendTo('body');
    return $('#searchResultsModal').modal({
      show: false
    });
  };

  showSearchDialog = function(msg) {
    return $('#searchResultsModal').modal('show');
  };

  resultsReceived = function(msg) {
    var html, json, numResults, r, results, _i, _len;
    json = JSON.parse(msg);
    html = '';
    numResults = json['count'];
    results = json['results'];
    if (numResults === '0') {
      html += '<p>Sorry, no results found.</p>';
    } else {
      html += '<p>' + numResults + ' results found.</p>';
      for (_i = 0, _len = results.length; _i < _len; _i++) {
        r = results[_i];
        html += '<p><a href="/node/' + r[0] + '">' + r[1] + '</a></p>';
      }
    }
    $('#searchResultsBody').html(html);
    return showSearchDialog(msg);
  };

  searchRequest = function(query, callback) {
    return $.ajax({
      type: "POST",
      url: "/search",
      data: "q=" + query.toLowerCase(),
      dataType: "text",
      success: callback
    });
  };

  searchQuery = function() {
    searchRequest($("#search-input-field").val(), resultsReceived);
    return false;
  };

  String.prototype.replaceAll = function(str1, str2, ignore) {
  return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
};

  autoUpdateUsername = true;

  usernameStatus = 'unknown';

  emailStatus = 'unknown';

  submitting = false;

  initSignUpDialog = function() {
    var dialogHtml;
    dialogHtml = $("<div class=\"modal hide\" id=\"signUpModal\">\n  <div class=\"modal-header\">\n    <a class=\"close\" data-dismiss=\"modal\">×</a>\n    <h3>Sign Up</h3>\n  </div>\n  <form class=\"signupForm\">\n    <div class=\"modal-body\" id=\"registerLoginBody\">\n      <fieldset id=\"nameFieldSet\">\n        <label>Name</label>\n        <input id=\"suName\" type=\"text\" class=\"span3\" placeholder=\"Or an alias if you prefer\">\n        <span id=\"nameErrMsg\" class=\"help-inline\" />\n      </fieldset>\n      <fieldset id=\"usernameFieldSet\">\n        <label>Username</label>\n        <input id=\"suUsername\" type=\"text\" class=\"span3\" placeholder=\"Unique identifier\">\n        <span id=\"usernameErrMsg\" class=\"help-inline\" />\n      </fieldset>\n      <fieldset id=\"emailFieldSet\">\n        <label>Email</label>\n        <input id=\"suEmail\" type=\"text\" class=\"span3\" placeholder=\"Will not be seen by other members\">\n        <span id=\"emailErrMsg\" class=\"help-inline\" />\n        <span class=\"help-block\">We will never give or sell it to third-parties.</span>\n      </fieldset>\n      <fieldset id=\"passFieldSet\">\n        <label>Password</label>\n        <input id=\"suPassword\" type=\"password\" class=\"span3\" placeholder=\"A good password\">\n        <input id=\"suPassword2\" type=\"password\" class=\"span3\" placeholder=\"Confirm password\">\n        <span id=\"passErrMsg\" class=\"help-inline\" />\n      </fieldset>\n    </div>\n    <div class=\"modal-footer\">\n      </form>\n      <a class=\"btn\" data-dismiss=\"modal\">Close</a>\n      <a id=\"signupButton\" class=\"btn btn-primary\">Sign Up</a>\n    </div>\n  </form>\n</div>");
    dialogHtml.appendTo('body');
    return $('#signupButton').click(signup);
  };

  initLoginDialog = function() {
    var dialogHtml;
    dialogHtml = $("<div class=\"modal hide\" id=\"loginModal\">\n  <div class=\"modal-header\">\n    <a class=\"close\" data-dismiss=\"modal\">×</a>\n    <h3>Login</h3>\n  </div>\n  <form class=\"loginForm\">\n    <div class=\"modal-body\" id=\"registerLoginBody\">\n      <fieldset id=\"logEmailFieldSet\">\n        <label>Email or Username</label>\n        <input id=\"logEmail\" type=\"text\" class=\"span3\">\n        <span id=\"logEmailErrMsg\" class=\"help-inline\" />\n      </fieldset>\n      <fieldset id=\"logPassFieldSet\">\n        <label>Password</label>\n        <input id=\"logPassword\" type=\"password\" class=\"span3\">\n        <span id=\"logPassErrMsg\" class=\"help-inline\" />\n      </fieldset>\n      <fieldset id=\"loginMessageFieldSet\" class=\"control-group error\">\n        <span id=\"loginMessage\" class=\"help-inline\" />\n      </fieldset>\n    </div>\n    <div class=\"modal-footer\">\n      <a class=\"btn\" data-dismiss=\"modal\">Close</a>\n      <a id=\"loginButton\" class=\"btn btn-primary\" data-dismiss=\"modal\">Login</a>\n    </div>\n  </form>\n</div>");
    dialogHtml.appendTo('body');
    $('#loginButton').click(login);
    $('#suName').keyup(updateUsername);
    $('#suName').blur(checkUsername);
    $('#suUsername').keyup(usernameChanged);
    $('#suUsername').blur(checkUsername);
    $('#suEmail').keyup(emailChanged);
    return $('#suEmail').blur(checkEmail);
  };

  showSignUpDialog = function() {
    return $('#signUpModal').modal('show');
  };

  showLoginDialog = function() {
    return $('#loginModal').modal('show');
  };

  clearSignupErrors = function() {
    $('#nameFieldSet').removeClass('control-group error');
    $('#usernameFieldSet').removeClass('control-group error');
    $('#emailFieldSet').removeClass('control-group error');
    $('#passFieldSet').removeClass('control-group error');
    $('#nameErrMsg').html('');
    $('#usernameErrMsg').html('');
    $('#emailErrMsg').html('');
    return $('#passErrMsg').html('');
  };

  clearLoginErrors = function() {
    $('#logEmailFieldSet').removeClass('control-group error');
    $('#logPassFieldSet').removeClass('control-group error');
    $('#logEmailErrMsg').html('');
    $('#logPassErrMsg').html('');
    return $('#loginMessage').html('');
  };

  signup = function() {
    var email, filter, name, password, password2, username;
    clearSignupErrors();
    name = $("#suName").val();
    username = $("#suUsername").val();
    email = $("#suEmail").val();
    password = $("#suPassword").val();
    password2 = $("#suPassword2").val();
    if (name === '') {
      $('#nameFieldSet').addClass('control-group error');
      $('#nameErrMsg').html('Name cannot be empty.');
      return false;
    }
    if (username === '') {
      $('#usernameFieldSet').addClass('control-group error');
      $('#usernameErrMsg').html('Username cannot be empty.');
      return false;
    }
    if (email === '') {
      $('#emailFieldSet').addClass('control-group error');
      $('#emailErrMsg').html('Email cannot be empty.');
      return false;
    }
    filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (!filter.test(email)) {
      $('#emailFieldSet').addClass('control-group error');
      $('#emailErrMsg').html('Not a valid email address.');
      return false;
    }
    if (password === '') {
      $('#passFieldSet').addClass('control-group error');
      $('#passErrMsg').html('You must specify a password.');
      return false;
    }
    if (password !== password2) {
      $('#passFieldSet').addClass('control-group error');
      $('#passErrMsg').html('Passwords do not match.');
      return false;
    }
    if (usernameStatus === 'exists') {
      return false;
    } else if (usernameStatus === 'unknown') {
      submitting = true;
      checkUsername();
      return false;
    }
    if (emailStatus === 'exists') {
      return false;
    } else if (emailStatus === 'unknown') {
      submitting = true;
      checkEmail();
      return false;
    }
    $.ajax({
      type: "POST",
      url: "/signup",
      data: "name=" + name + "&username=" + username + "&email=" + email + "&password=" + password,
      dataType: "text",
      success: signupReply
    });
    return false;
  };

  login = function() {
    var logEmail, password;
    clearLoginErrors();
    logEmail = $("#logEmail").val();
    password = $("#logPassword").val();
    if (logEmail === '') {
      $('#logEmailFieldSet').addClass('control-group error');
      $('#logEmailErrMsg').html('Email / Username cannot be empty.');
      return false;
    }
    if (password === '') {
      $('#logPassFieldSet').addClass('control-group error');
      $('#logPassErrMsg').html('Password cannot be empty.');
      return false;
    }
    $.ajax({
      type: "POST",
      url: "/login",
      data: "login=" + logEmail + "&password=" + password,
      dataType: "text",
      success: loginReply
    });
    return false;
  };

  signupReply = function(msg) {
    return $('#signUpModal').modal('hide');
  };

  loginReply = function(msg) {
    var response;
    if (msg === "failed") {
      return $('#loginMessage').html('Wrong username / email or password.');
    } else {
      response = msg.split(' ');
      $.cookie('username', response[0], {
        path: '/'
      });
      $.cookie('session', response[1], {
        path: '/'
      });
      return location.reload();
    }
  };

  logout = function() {
    $.cookie('username', '', {
      path: '/'
    });
    $.cookie('session', '', {
      path: '/'
    });
    return location.reload();
  };

  usernameChanged = function(msg) {
    autoUpdateUsername = false;
    return usernameStatus = 'unknown';
  };

  updateUsername = function(msg) {
    var username;
    if (autoUpdateUsername) {
      username = $("#suName").val().toLowerCase().replaceAll(" ", "_");
      $("#suUsername").val(username);
      return usernameStatus = 'unknown';
    }
  };

  emailChanged = function(msg) {
    return emailStatus = 'unknown';
  };

  checkUsername = function() {
    if ($("#suUsername").val() !== '') {
      return $.ajax({
        type: "POST",
        url: "/checkusername",
        data: "username=" + $("#suUsername").val(),
        dataType: "text",
        success: checkUsernameReply
      });
    }
  };

  checkUsernameReply = function(msg) {
    var response, status, username;
    response = msg.split(' ');
    status = response[0];
    username = response[1];
    if (username === $("#suUsername").val()) {
      if (status === 'ok') {
        usernameStatus = 'ok';
        $('#usernameFieldSet').removeClass('control-group error');
        $('#usernameFieldSet').addClass('control-group success');
        $('#usernameErrMsg').html('Nice, this username is available.');
        if (submitting) return signup();
      } else {
        usernameStatus = 'exists';
        $('#usernameFieldSet').removeClass('control-group success');
        $('#usernameFieldSet').addClass('control-group error');
        $('#usernameErrMsg').html('Sorry, this username is already in use.');
        return submitting = false;
      }
    }
  };

  checkEmail = function() {
    if ($("#suEmail").val() !== '') {
      return $.ajax({
        type: "POST",
        url: "/checkemail",
        data: "email=" + $("#suEmail").val(),
        dataType: "text",
        success: checkEmailReply
      });
    }
  };

  checkEmailReply = function(msg) {
    var email, response, status;
    response = msg.split(' ');
    status = response[0];
    email = response[1];
    if (email === $("#suEmail").val()) {
      if (status === 'ok') {
        emailStatus = 'ok';
        $('#emailFieldSet').removeClass('control-group error');
        $('#emailFieldSet').addClass('control-group success');
        $('#emailErrMsg').html('');
        if (submitting) return signup();
      } else {
        emailStatus = 'exists';
        $('#emailFieldSet').removeClass('control-group success');
        $('#emailFieldSet').addClass('control-group error');
        $('#emailErrMsg').html('Sorry, this email is already in use.');
        return submitting = false;
      }
    }
  };

  aiChatVisible = false;

  initAiChat = function() {
    var html;
    html = "<div id=\"ai-chat-log\" />\n<form id=\"ai-chat-form\">\n<input id=\"ai-chat-input\" type=\"text\" />\n</form>";
    $('#ai-chat').html(html);
    return $('#ai-chat-form').submit(aiChatSubmit);
  };

  aiChatAddLine = function(line) {
    var height;
    $('#ai-chat-log').append(line);
    height = $('#ai-chat')[0].scrollHeight;
    return $('#ai-chat').scrollTop(height);
  };

  aiChatSubmit = function(msg) {
    var sentence;
    sentence = $('#ai-chat-input').val();
    aiChatAddLine('<br />you: ' + sentence);
    $('#ai-chat-input').val('');
    $.ajax({
      type: "POST",
      url: "/ai",
      data: "sentence=" + sentence + "&rootId=" + rootNodeId,
      dataType: "text",
      success: aiChatReply
    });
    return false;
  };

  aiChatReply = function(msg) {
    var reply;
    reply = $.parseJSON(msg);
    aiChatAddLine('<br />GraphBrain: ' + reply['sentence']);
    if (reply['goto'] !== '') {
      return window.location.href = '/node/' + reply['goto'];
    }
  };

  showAiChat = function() {
    return $('#ai-chat').css('display', 'block');
  };

  hideAiChat = function() {
    return $('#ai-chat').css('display', 'none');
  };

  aiChatButtonPressed = function(msg) {
    if (aiChatVisible) {
      aiChatVisible = false;
      return hideAiChat();
    } else {
      aiChatVisible = true;
      return showAiChat();
    }
  };

  removeMode = false;

  removeInfoMessage = function() {
    return setInfoAlert('<strong>Click on the item</strong> you want to remove.');
  };

  removeButtonPressed = function(msg) {
    if (removeMode) {
      hideAlert();
      removeMode = false;
    } else {
      removeInfoMessage();
      removeMode = true;
    }
    return true;
  };

  initRemoveDialog = function() {
    var dialogHtml;
    dialogHtml = $("<div class=\"modal hide\" id=\"removeModal\">\n  <div class=\"modal-header\">\n    <a class=\"close\" data-dismiss=\"modal\">×</a>\n    <h3>Remove</h3>\n  </div>\n  <form id=\"removeForm\" action='/node/" + rootNodeId + "' method=\"post\">\n  <input type=\"hidden\" name=\"op\" value=\"remove\">\n  <input id=\"removeNodeField\" type=\"hidden\" name=\"node\">\n  <input id=\"removeOrigField\" type=\"hidden\" name=\"orig\">\n  <input id=\"removeLinkField\" type=\"hidden\" name=\"link\">\n  <input id=\"removeTargField\" type=\"hidden\" name=\"targ\">\n  <div class=\"modal-body\" id=\"addBrainBody\">\n      <div id=\"linkDesc\"></div>\n      <label class=\"radio\">\n          <input id=\"linkRadio\" type=\"radio\" name=\"linkOrNode\" value=\"link\">\n          Just remove this connection\n      </label>\n      <br />\n      <div id=\"itemDesc\">Item</div>\n      <label class=\"radio\">\n          <input id=\"nodeRadio\" type=\"radio\" name=\"linkOrNode\" value=\"node\">\n          Remove this item and all associated connections\n      </label>\n  </div>\n  <div class=\"modal-footer\">\n    <a class=\"btn\" data-dismiss=\"modal\">Close</a>\n    <a id=\"removeDlgButton\" class=\"btn btn-primary\">Remove</a>\n  </div>\n</form>\n</div>");
    dialogHtml.appendTo('body');
    return $('#removeDlgButton').click(removeAction);
  };

  showRemoveDialog = function(node, orig, link, targ) {
    if (node === rootNodeId) {
      return setErrorAlert('You cannot remove the item in the center.');
    } else {
      $('#linkRadio').attr('checked', true);
      $('#nodeRadio').attr('checked', false);
      $('#linkRadio').attr('disabled', false);
      $('#nodeRadio').attr('disabled', false);
      if (nodes[node].type === 'user') {
        $('#nodeRadio').attr('disabled', true);
      } else if ((link === 'brain') && (nodes[orig].type === 'user') && (nodes[targ].type === 'brain')) {
        $('#linkRadio').attr('disabled', true);
        $('#linkRadio').attr('checked', false);
        $('#nodeRadio').attr('checked', true);
      }
      removeInfoMessage();
      $('#removeNodeField').val(node);
      $('#removeOrigField').val(orig);
      $('#removeLinkField').val(link);
      $('#removeTargField').val(targ);
      $('#linkDesc').html(nodes[orig].text + ' <strong>' + link + '</strong> ' + nodes[targ].text);
      $('#itemDesc').html(nodes[node].text);
      return $('#removeModal').modal('show');
    }
  };

  removeAction = function() {
    return $('#removeForm').submit();
  };

  nodeView = false;

  $(function() {
    if (typeof snodes !== 'undefined') nodeView = true;
    if (nodeView) initGraph();
    return initInterface();
  });

}).call(this);
