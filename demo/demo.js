
var text = " 李嚴，我說那個醬汁呢？你忘了嗎？空泛的言語是不能掩蓋你沒有醬汁的事實的阿？ ".split('');

for (var i = 0; i < text.length; i++) {
  $('.wrap').append(
    $('<div>')
    .addClass('item')
    .append($('<div class="test">').text(text[i]))
    .append($('<div class="test1">').text(text[i]))
    .append($('<div class="test2">').text(text[i]))
  )
}

function calcCylinder (percentage, height) {
  var angleDeg = - (percentage - 0.5) * 180;
  var angle = angleDeg / 180 * Math.PI;
  
  var zOffset = Math.cos(angle) * height / 2;
  var yOffset = Math.sin(angle) * height / 2 + (height * percentage - height * 0.5);
  
  return {
    angle : - angle,
    angleDeg : - angleDeg,
    zOffset : zOffset,
    yOffset : yOffset
  }
}

function getTransform (percentage, height) {
  var temp = calcCylinder(percentage, height);
  //console.log("translateY(" + temp.yOffset + "px) translateZ(" + temp.zOffset + "px) rotateX(" + temp.angleDeg + "deg)");
  return "translateY(" + temp.yOffset + "px) translateZ(" + temp.zOffset + "px) rotateX(" + temp.angleDeg + "deg)";
}

$('.item').parallax( {
  update :  function (event) {
    $(this).find('.test').css('opacity', 1 -Math.abs(event.p1Top * 2 - 1));

    $(this).find('.test').css('transform',  getTransform(event.p4Top, event.parentHeight) );
    $(this).find('.test').css('-webkit-transform',  getTransform(event.p4Top, event.parentHeight) );

    $(this).find('.test1').css('opacity',  1 -Math.abs(event.p2Top * 2 - 1));

    $(this).find('.test1').css('transform',  getTransform(event.p4Top, event.parentHeight) );
    $(this).find('.test1').css('-webkit-transform',  getTransform(event.p4Top, event.parentHeight) );
    
    $(this).find('.test1').css('background',  'hsla(' + ((256 - event.p3Top * 256) >>> 0) + ',100%,50%,1)' );
    //alert('hsla(' + ((data.p3Top * 256) >>> 0) + ',100%,50%,1)');
    
    $(this).find('.test2').css('opacity',  1 -Math.abs(event.p3Top * 2 - 1));

    $(this).find('.test2').css('transform',  getTransform(event.p4Top, event.parentHeight) );
    $(this).find('.test2').css('-webkit-transform',  getTransform(event.p4Top, event.parentHeight) );

  },
  leave : function () {
    $(this).find('.test').css('transform', 'none');
    $(this).find('.test').css('-webkit-transform',  'none');
    $(this).find('.test1').css('transform', 'none');
    $(this).find('.test1').css('-webkit-transform',  'none');
    $(this).find('.test2').css('transform', 'none');
    $(this).find('.test2').css('-webkit-transform',  'none');
    $(this).find('.test').css('opacity',  1);
    $(this).find('.test1').css('opacity',  1);
    $(this).find('.test2').css('opacity',  1);
    
    $(this).find('.test1').css('background', '');
  },
  enter : function () {
    $(this).find('.test').css('opacity',  0);
    $(this).find('.test1').css('opacity',  0);
    $(this).find('.test2').css('opacity',  0);
  }
});

$('<div>').prependTo('.wrap').parallax({
  update : function (event) {
    var wait = 256;
    if (event.toTop < -wait) {
      $(this).find('.test1').text(event.toTop + 'px')
      .css('position', 'fixed')
      .css('top' , '0px')
      .css('height', (event.childHeight - wait) + 'px')
      .css('line-height', (event.childHeight - wait) + 'px')
      .css('font-size', Math.min((event.childHeight - wait) * 0.8, 80) + 'px');
    } else if (event.toTop < 0) {
      $(this).find('.test1').text(event.toTop + 'px')
      .css('position', 'fixed')
      .css('top' , '0px')
      .css('height', (event.childHeight + event.toTop) + 'px')
      .css('line-height', (event.childHeight + event.toTop) + 'px')
      .css('font-size', Math.min((event.childHeight + event.toTop) * 0.8, 80) + 'px');
    } else {
      $(this).find('.test1').text(event.toTop + 'px')
      .css('position', 'relative')
      .css('height', event.childHeight + 'px')
      .css('line-height', event.childHeight + 'px')
      .css('font-size', Math.min(event.childHeight * 0.8, 80) + 'px');
    }
  },
  onlyVisable : false
}).append($('<div class="test1">').css({
  left : '0px',
  width : '100%',
  'box-sizing' : 'border-box',
  border : '4px solid #777777'
})).css({
  'z-index' : 99999,
  height : '320px',
  position : 'relative'
});

$('<div>').css('height', '100px').prependTo('body');
