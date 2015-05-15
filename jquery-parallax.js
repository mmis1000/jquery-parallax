;(function ($, window, document, undefiend) {
  
  // https://github.com/slindberg/jquery-scrollparent
  var NAMESPACE = "parallax";
  
  if (!$.fn.scrollParent) {
    $.fn.scrollParent = function() {
      var overflowRegex = /(auto|scroll)/,
          position = this.css( "position" ),
          excludeStaticParent = position === "absolute",
          scrollParent = this.parents().filter( function() {
            var parent = $( this );
            if ( excludeStaticParent && parent.css( "position" ) === "static" ) {
              return false;
            }
            return (overflowRegex).test( parent.css( "overflow" ) + parent.css( "overflow-y" ) + parent.css( "overflow-x" ) );
          }).eq( 0 );

      return position === "fixed" || !scrollParent.length ? $( this[ 0 ].ownerDocument || document ) : scrollParent;
    };
  }

  function cloneObject(obj) {
    var newObj = {}, key;
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        newObj[key] = obj[key]
      }
    }
    return newObj;
  }
  
  $.fn.parallax = function (option) {
    
    if (this.length > 1) {
      this.each(function () {
        $(this).parallax(option);
      })
      return this;
    }
    
    if (option === 'none') {
      removeHandle(this);
      return this;
    }
    
    if ('object' === typeof option) {
      option = cloneObject(option);
    }
    
    if (undefined === option) {
      option = {
        enter : null,
        update : null,
        leave : null,
      }
    }
    
    if ('function' === typeof option) {
      option = {
        enter : null,
        update : option,
        leave : null,
      }
    }
    
    if ('object' !== typeof option && option !== undefiend) {
      throw new Error("create parallax with invalid type doesn't make sense.!");
    }
    
    option.parent = option.parent || $(this).scrollParent();
    
    /*
     * since html does not fire scroll events and height of html element is meanless
     * maybe we need to find a better way..
     */
    if (option.parent.is('html')) {
      option.parent = $(document);
    }
    if ($(option.parent).length === 0) {
      option.parent = $(document);
    }
    
    option.child = $(this);
    option.onlyVisable = option.onlyVisable === undefiend ? true : option.onlyVisable;
    option.spy = option.spy === undefiend ? 'vertical' : option.spy;
    
    console.log(option);
    bindHandle(option);
    
    this.data(NAMESPACE, option);
    
    return this;
  }
  
  function removeHandle (el) {
    
    el.trigger(NAMESPACE + '_leave');
    
    el.off(NAMESPACE + '_enter');
    el.off(NAMESPACE + '_update');
    el.off(NAMESPACE + '_leave');
    
    var option = el.data(NAMESPACE);
    option.parent.off('scroll.' + NAMESPACE, option._listener);
    
    el.removeData(NAMESPACE);
  }
  
  function bindHandle(option) {
    //option._showing = null;
    option._listener = handle.bind(null, option.parent, option.child, option);
    //console.log(option);
    
    $(option.parent).on(
      'scroll' + '.' + NAMESPACE,
      option._listener
    )
    //console.log(option.parent, 'scroll' + '.' + NAMESPACE);
    if (option.enter) {
      $(option.child).on(NAMESPACE + '_enter', option.enter);
    }
    if (option.update) {
      $(option.child).on(NAMESPACE + '_update', option.update);
    }
    if (option.leave) {
      $(option.child).on(NAMESPACE + '_leave', option.leave);
    }
    $(function () {
      $(option.parent).trigger('scroll' + '.' + NAMESPACE);
    })
    //trigger a event to force view update
  }
  
  function handle(parent, child, option, event) {
    //console.log(arguments);
    var scrollLeft = parent.scrollLeft();
    var scrollTop = parent.scrollTop();
    
    var offsetParent = parent.offset() || {left : 0, top : 0};
    var offsetChild = child.offset();
    
    var rawParent = parent.get(0);
    
    var hasHorizontalScrollbar= rawParent.scrollWidth>rawParent.clientWidth;
    var hasVerticalScrollbar= rawParent.scrollHeight>rawParent.clientHeight;
    
    var parentWidth, parentHeight, offsetLeft, offsetTop;
    
    // some problem will happen with document element, so we need to handle it by another way
    // height of document is meaningless and useless in common case
    // scroll position does not affect the offset of element related to document
    if (parent.get(0) === document) {
      parentWidth = $(window).width();
      parentHeight = $(window).height();
      offsetLeft = offsetChild.left - offsetParent.left;
      offsetTop = offsetChild.top - offsetParent.top;
    } else {
      parentWidth = $(parent).width();
      parentHeight = $(parent).height();
      offsetLeft = offsetChild.left - offsetParent.left + scrollLeft;
      offsetTop = offsetChild.top - offsetParent.top + scrollTop;
    }
    
    var childWidth = $(child).outerWidth();
    var childHeight = $(child).outerHeight();
    
    
    var trigerEnter = false, trigerUpdate = false, trigerLeave = false;
    
    var currentShow = option._showing;
    var shouldShow = false;
    
    if (option.spy === 'vertical') {
      shouldShow = offsetTop + childHeight >= scrollTop &&
        scrollTop + parentHeight >= offsetTop;
    }
    
    if (option.spy === 'horizontal') {
      shouldShow = offsetLeft + childWidth >= scrollLeft &&
        scrollLeft + parentWidth >= offsetLeft;
    }
    
    if (option.spy === 'both') {
      shouldShow = offsetTop + childHeight >= scrollTop &&
        scrollTop + parentHeight >= offsetTop &&
        offsetLeft + childWidth >= scrollLeft &&
        scrollLeft + parentWidth >= offsetLeft;
    }
    
    if (!option.onlyVisable) {
      shouldShow = true;
    }
    
    if ((currentShow === false || currentShow == null) && shouldShow === true) {
      trigerEnter = true;
    }
    if ((currentShow === true || currentShow == null) && shouldShow === false) {
      trigerLeave = true;
    }
    if (shouldShow) {
      trigerUpdate = true;
    }
    
    var event = {
      scrollTop : scrollTop,
      scrollLeft : scrollLeft,
      offsetTop : offsetTop,
      offsetLeft : offsetLeft,
      childWidth : childWidth,
      childHeight : childHeight,
      parentWidth : parentWidth,
      parentHeight : parentHeight,
      shouldShow : shouldShow,
      currentShow : currentShow
    }
    cauculateExtra(event);
    //console.log(event);
    if (trigerEnter) {
      child.trigger(jQuery.Event(NAMESPACE + '_enter', event));
    }
    if (trigerLeave) {
      child.trigger(jQuery.Event(NAMESPACE + '_leave', event));
    }
    if (trigerUpdate) {
      child.trigger(jQuery.Event(NAMESPACE + '_update', event));
    }
    //console.log(shouldShow, currentShow, option, option._showing);
    option._showing = shouldShow;
  }
  
  function cauculateExtra (ev) {
    var p1Left, p1Top, p2Left, p2Top, p3Left, p3Top;
    
    p1Left = (ev.scrollLeft - (ev.offsetLeft - ev.parentWidth) ) / ( ev.parentWidth + ev.childWidth );
    p1Top = (ev.scrollTop - (ev.offsetTop - ev.parentHeight) ) / ( ev.parentHeight + ev.childHeight );
    ev.p1Left = p1Left;
    ev.p1Top = p1Top;
    
    if (ev.parentHeight >= ev.childHeight) {
      if (ev.scrollTop >= ev.offsetTop - ev.parentHeight + ev.childHeight &&
          ev.scrollTop <= ev.offsetTop
         ) {
        p2Top = 0.5;
      }
      if (ev.scrollTop < ev.offsetTop - ev.parentHeight + ev.childHeight) {
        p2Top = 0.5 - (ev.offsetTop - ev.parentHeight + ev.childHeight - ev.scrollTop) / ev.childHeight / 2;
      }
      if (ev.scrollTop > ev.offsetTop) {
        p2Top = 0.5 + (ev.scrollTop - ev.offsetTop) / ev.childHeight / 2;
      }
    } else {
      if (ev.offsetTop <= ev.scrollTop && 
          ev.scrollTop + ev.parentHeight <= ev.offsetTop + ev.childHeight
         ) {
        p2Top = 0.5;
      }
      if (ev.offsetTop > ev.scrollTop) {
        p2Top =  ((ev.scrollTop - ev.offsetTop) / ev.parentHeight + 1) / 2;
      }
      if (ev.scrollTop + ev.parentHeight > ev.offsetTop + ev.childHeight) {
        p2Top = ((ev.scrollTop + ev.parentHeight - ev.offsetTop - ev.childHeight) / ev.parentHeight + 1)  / 2;
      }
    }
    ev.p2Top = p2Top;
    
    
    if (ev.parentWidth >= ev.childWidth) {
      if (ev.scrollLeft >= ev.offsetLeft - ev.parentWidth + ev.childWidth &&
          ev.scrollLeft <= ev.offsetLeft
         ) {
        p2Left = 0.5;
      }
      if (ev.scrollLeft < ev.offsetLeft - ev.parentWidth + ev.childWidth) {
        p2Left = 0.5 - (ev.offsetLeft - ev.parentWidth + ev.childWidth - ev.scrollLeft) / ev.childWidth / 2;
      }
      if (ev.scrollLeft > ev.offsetLeft) {
        p2Left = 0.5 + (ev.scrollLeft - ev.offsetLeft) / ev.childWidth / 2;
      }
    } else {
      if (ev.offsetLeft <= ev.scrollLeft && 
          ev.scrollLeft + ev.parentWidth <= ev.offsetLeft + ev.childWidth
         ) {
        p2Left = 0.5;
      }
      if (ev.offsetLeft > ev.scrollLeft) {
        p2Left =  ((ev.scrollLeft - ev.offsetLeft) / ev.parentWidth + 1) / 2;
      }
      if (ev.scrollTop + ev.parentHeight > ev.offsetLeft + ev.childHeight) {
        p2Left = ((ev.scrollLeft + ev.parentWidth - ev.offsetLeft - ev.childWidth) / ev.parentWidth + 1)  / 2;
      }
    }
    ev.p2Left = p2Left;
    
    if (ev.parentHeight < ev.childHeight) {
      p3Top = 0.5;
    } else {
      var pos0 = ev.offsetTop + ev.childHeight - ev.parentHeight;
      var pos1 = ev.offsetTop;
      
      p3Top = (ev.scrollTop - pos0) / (pos1 - pos0);
    }
    ev.p3Top = p3Top;
    ev.p3Top = ev.p3Top > 1 ? 1 : ev.p3Top < 0 ? 0 : ev.p3Top;
    ev.p3Top = isNaN(ev.p3Top) ? 0.5 : ev.p3Top;
    
    
    if (ev.parentWidth < ev.childWidth) {
      p3Left = 0.5;
    } else {
      var pos0 = ev.offsetLeft + ev.childWidth - ev.parentWidth;
      var pos1 = ev.offsetLeft;
      
      p3Left = (ev.scrollLeft - pos0) / (pos1 - pos0);
    }
    ev.p3Left = p3Left;
    ev.p3Left = ev.p3Left > 1 ? 1 : ev.p3Left < 0 ? 0 : ev.p3Left;
    ev.p3Left = isNaN(ev.p3Left) ? 0.5 : ev.p3Left;
    
    ev.toTop = ev.offsetTop - ev.scrollTop;
    ev.toBottom =  ev.offsetTop + ev.childHeight - ev.scrollTop - ev.parentHeight;
    
    ev.p4Top = 1 - (ev.offsetTop + ev.childHeight / 2 - ev.scrollTop) / ev.parentHeight;
    ev.p4Left = 1 - (ev.offsetLeft + ev.childWidth / 2 - ev.scrollLeft) / ev.parentWidth;

  }
  
} (jQuery, window, document));
