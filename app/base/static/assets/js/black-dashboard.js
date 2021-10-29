/*!

=========================================================
* Black Dashboard - v1.0.1
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard
* Copyright 2019 Creative Tim (https://www.creative-tim.com)


* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/

var transparent = true;
var transparentDemo = true;
var fixedTop = false;

var navbar_initialized = false;
var backgroundOrange = false;
var sidebar_mini_active = false;
var toggle_initialized = false;

var $html = $('html');
var $body = $('body');
var $navbar_minimize_fixed = $('.navbar-minimize-fixed');
var $collapse = $('.collapse');
var $navbar = $('.navbar');
var $tagsinput = $('.tagsinput');
var $selectpicker = $('.selectpicker');
var $navbar_color = $('.navbar[color-on-scroll]');
var $full_screen_map = $('.full-screen-map');
var $datetimepicker = $('.datetimepicker');
var $datepicker = $('.datepicker');
var $timepicker = $('.timepicker');

var seq = 0,
  delays = 80,
  durations = 500;
var seq2 = 0,
  delays2 = 80,
  durations2 = 500;










/* global window, define, module */
(function(global, factory) {
  var Gauge = factory(global);
  if(typeof define === "function" && define.amd) {
    // AMD support
    define(function() {return Gauge;});
  }else if(typeof module === "object" && module.exports) {
    // CommonJS support
    module.exports = Gauge;
  }else {
    // We are probably running in the browser
    global.Gauge = Gauge;
  }
})(typeof window === "undefined" ? this : window, function(global, undefined) {

  var document = global.document,
    slice = Array.prototype.slice,
    requestAnimationFrame = (global.requestAnimationFrame ||
        global.mozRequestAnimationFrame ||
        global.webkitRequestAnimationFrame ||
        global.msRequestAnimationFrame ||
        function(cb) {
          return setTimeout(cb, 1000 / 60);
        });

  // EXPERIMENTAL!!
  /**
   * Simplistic animation function for animating the gauge. That's all!
   * Options are:
   * {
   *  duration: 1,    // In seconds
   *  start: 0,       // The start value
   *  end: 100,       // The end value
   *  step: function, // REQUIRED! The step function that will be passed the value and does something
   *  easing: function // The easing function. Default is easeInOutCubic
   * }
   */
  function Animation(options) {
    var duration = options.duration,
        currentIteration = 1,
        iterations = 60 * duration,
        start = options.start || 0,
        end = options.end,
        change = end - start,
        step = options.step,
        easing = options.easing || function easeInOutCubic(pos) {
          // https://github.com/danro/easing-js/blob/master/easing.js
          if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
          return 0.5 * (Math.pow((pos-2),3) + 2);
        };

    function animate() {
      var progress = currentIteration / iterations, 
          value = change * easing(progress) + start;
      // console.log(progress + ", " + value);
      step(value, currentIteration);
      currentIteration += 1;

      if(progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    // start!
    requestAnimationFrame(animate);
  }



  var Gauge = (function() {
    var SVG_NS = "http://www.w3.org/2000/svg";

    var GaugeDefaults = {
      centerX: 50,
      centerY: 50
    };

    var defaultOptions = {
      dialRadius: 40,
      dialStartAngle: 135,
      dialEndAngle: 45,
      value: 0,
      max: 100,
      min: 0,
      valueDialClass: "value",
      valueClass: "value-text",
      dialClass: "dial",
      gaugeClass: "gauge",
      showValue: true,
      gaugeColor: null,
      label: function(val) {return Math.round(val);}
    };

    function shallowCopy(/* source, ...targets*/) {
      var target = arguments[0], sources = slice.call(arguments, 1);
      sources.forEach(function(s) {
        for(var k in s) {
          if(s.hasOwnProperty(k)) {
            target[k] = s[k];
          }
        }
      });
      return target;
    }

    /**
     * A utility function to create SVG dom tree
     * @param {String} name The SVG element name
     * @param {Object} attrs The attributes as they appear in DOM e.g. stroke-width and not strokeWidth
     * @param {Array} children An array of children (can be created by this same function)
     * @return The SVG element
     */
    function svg(name, attrs, children) {
      var elem = document.createElementNS(SVG_NS, name);
      for(var attrName in attrs) {
        elem.setAttribute(attrName, attrs[attrName]);
      }

      if(children) {
        children.forEach(function(c) {
          elem.appendChild(c);
        });
      }
      return elem;
    }

    /**
     * Translates percentage value to angle. e.g. If gauge span angle is 180deg, then 50%
     * will be 90deg
     */
    function getAngle(percentage, gaugeSpanAngle) {
      return percentage * gaugeSpanAngle / 100;
    }

    function normalize(value, min, limit) {
      var val = Number(value);
      if(val > limit) return limit;
      if(val < min) return min;
      return val;
    }

    function getValueInPercentage(value, min, max) {
      var newMax = max - min, newVal = value - min;
      return 100 * newVal / newMax;
      // var absMin = Math.abs(min);
      // return 100 * (absMin + value) / (max + absMin);
    }

    /**
     * Gets cartesian co-ordinates for a specified radius and angle (in degrees)
     * @param cx {Number} The center x co-oriinate
     * @param cy {Number} The center y co-ordinate
     * @param radius {Number} The radius of the circle
     * @param angle {Number} The angle in degrees
     * @return An object with x,y co-ordinates
     */
    function getCartesian(cx, cy, radius, angle) {
      var rad = angle * Math.PI / 180;
      return {
        x: Math.round((cx + radius * Math.cos(rad)) * 1000) / 1000,
        y: Math.round((cy + radius * Math.sin(rad)) * 1000) / 1000
      };
    }

    // Returns start and end points for dial
    // i.e. starts at 135deg ends at 45deg with large arc flag
    // REMEMBER!! angle=0 starts on X axis and then increases clockwise
    function getDialCoords(radius, startAngle, endAngle) {
      var cx = GaugeDefaults.centerX,
          cy = GaugeDefaults.centerY;
      return {
        end: getCartesian(cx, cy, radius, endAngle),
      	start: getCartesian(cx, cy, radius, startAngle)
      };
    }

    /**
     * Creates a Gauge object. This should be called without the 'new' operator. Various options
     * can be passed for the gauge:
     * {
     *    dialStartAngle: The angle to start the dial. MUST be greater than dialEndAngle. Default 135deg
     *    dialEndAngle: The angle to end the dial. Default 45deg
     *    radius: The gauge's radius. Default 400
     *    max: The maximum value of the gauge. Default 100
     *    value: The starting value of the gauge. Default 0
     *    label: The function on how to render the center label (Should return a value)
     * }
     * @param {Element} elem The DOM into which to render the gauge
     * @param {Object} opts The gauge options
     * @return a Gauge object
     */
    return function Gauge(elem, opts) {
      opts = shallowCopy({}, defaultOptions, opts);
      var gaugeContainer = elem,
          limit = opts.max,
          min = opts.min,
          value = normalize(opts.value, min, limit),
          radius = opts.dialRadius,
          displayValue = opts.showValue,
          startAngle = opts.dialStartAngle,
          endAngle = opts.dialEndAngle,
          valueDialClass = opts.valueDialClass,
          valueTextClass = opts.valueClass,
          valueLabelClass = opts.valueLabelClass,
          dialClass = opts.dialClass,
          gaugeClass = opts.gaugeClass,
          gaugeColor = opts.color,
          gaugeValueElem,
          gaugeValuePath,
          label = opts.label,
          viewBox = opts.viewBox,
          instance;

      if(startAngle < endAngle) {
        console.log("WARN! startAngle < endAngle, Swapping");
        var tmp = startAngle;
        startAngle = endAngle;
        endAngle = tmp;
      }

      function pathString(radius, startAngle, endAngle, largeArc) {
        var coords = getDialCoords(radius, startAngle, endAngle),
            start = coords.start,
            end = coords.end,
            largeArcFlag = typeof(largeArc) === "undefined" ? 1 : largeArc;

        return [
          "M", start.x, start.y, 
          "A", radius, radius, 0, largeArcFlag, 1, end.x, end.y
        ].join(" ");
      }

      function initializeGauge(elem) {
        gaugeValueElem = svg("text", {
          x: 50,
          y: 50,
          fill: "#999",
          "class": valueTextClass,
          "font-size": "100%",
          "font-family": "sans-serif",
          "font-weight": "normal",
          "text-anchor": "middle",
          "alignment-baseline": "middle",
          "dominant-baseline": "central"
        });

        gaugeValuePath = svg("path", {
          "class": valueDialClass,
          fill: "none",
          stroke: "#666",
          "stroke-width": 2.5,
          d: pathString(radius, startAngle, startAngle) // value of 0
        });

        var angle = getAngle(100, 360 - Math.abs(startAngle - endAngle));
        var flag = angle <= 180 ? 0 : 1;
        var gaugeElement = svg("svg", {"viewBox": viewBox || "0 0 100 100", "class": gaugeClass}, [
          svg("path", {
            "class": dialClass,
            fill: "none",
            stroke: "#eee",
            "stroke-width": 2,
            d: pathString(radius, startAngle, endAngle, flag)
          }),
          svg("g", { "class": "text-container" }, [gaugeValueElem]),
          gaugeValuePath
        ]);
        elem.appendChild(gaugeElement);
      }

      function updateGauge(theValue, frame) {
        var val = getValueInPercentage(theValue, min, limit),
            // angle = getAngle(val, 360 - Math.abs(endAngle - startAngle)),
            angle = getAngle(val, 360 - Math.abs(startAngle - endAngle)),
            // this is because we are using arc greater than 180deg
            flag = angle <= 180 ? 0 : 1;
        if(displayValue) {
          gaugeValueElem.textContent = label.call(opts, theValue);
        }
        gaugeValuePath.setAttribute("d", pathString(radius, startAngle, angle + startAngle, flag));
      }

      function setGaugeColor(value, duration) {        
        var c = gaugeColor.call(opts, value), 
            dur = duration * 1000,
            pathTransition = "stroke " + dur + "ms ease";
            // textTransition = "fill " + dur + "ms ease";

        gaugeValuePath.style.stroke = c;
        gaugeValuePath.style["-webkit-transition"] = pathTransition;
        gaugeValuePath.style["-moz-transition"] = pathTransition;
        gaugeValuePath.style.transition = pathTransition;
        /*
        gaugeValueElem.style = [
          "fill: " + c,
          "-webkit-transition: " + textTransition,
          "-moz-transition: " + textTransition,
          "transition: " + textTransition,
        ].join(";");
        */
      }

      instance = {
        setMaxValue: function(max) {
          limit = max;
        },
        setValue: function(val) {
          value = normalize(val, min, limit);
          if(gaugeColor) {
            setGaugeColor(value, 0)
          }
          updateGauge(value);
        },
        setValueAnimated: function(val, duration) {
        	var oldVal = value;
          value = normalize(val, min, limit);
          if(oldVal === value) {
            return;
          }

          if(gaugeColor) {
            setGaugeColor(value, duration);
          }
          Animation({
            start: oldVal || 0,
            end: value,
            duration: duration || 1,
            step: function(val, frame) {
              updateGauge(val, frame);
            }
          });
        },
        getValue: function() {
          return value;
        }
      };

      initializeGauge(gaugeContainer);
      instance.setValue(value);
      return instance;
    };
  })();

  return Gauge;
});






(function() {
  var isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

  if (isWindows) {
    // if we are on windows OS we activate the perfectScrollbar function
    if ($('.main-panel').length != 0) {
      var ps = new PerfectScrollbar('.main-panel', {
        wheelSpeed: 2,
        wheelPropagation: true,
        minScrollbarLength: 20,
        suppressScrollX: true
      });
    }

    if ($('.sidebar .sidebar-wrapper').length != 0) {

      var ps1 = new PerfectScrollbar('.sidebar .sidebar-wrapper');
      $('.table-responsive').each(function() {
        var ps2 = new PerfectScrollbar($(this)[0]);
      });
    }



    $html.addClass('perfect-scrollbar-on');
  } else {
    $html.addClass('perfect-scrollbar-off');
  }
})();

$(document).ready(function() {

  var scroll_start = 0;
  var startchange = $('.row');
  var offset = startchange.offset();
  var scrollElement = navigator.platform.indexOf('Win') > -1 ? $(".ps") : $(window);
  scrollElement.scroll(function() {

    scroll_start = $(this).scrollTop();

    if (scroll_start > 50) {
      $(".navbar-minimize-fixed").css('opacity', '1');
    } else {
      $(".navbar-minimize-fixed").css('opacity', '0');
    }
  });


  $(document).scroll(function() {
    scroll_start = $(this).scrollTop();
    if (scroll_start > offset.top) {
      $(".navbar-minimize-fixed").css('opacity', '1');
    } else {
      $(".navbar-minimize-fixed").css('opacity', '0');
    }
  });

  if ($('.full-screen-map').length == 0 && $('.bd-docs').length == 0) {
    // On click navbar-collapse the menu will be white not transparent
    $('.collapse').on('show.bs.collapse', function() {
      $(this).closest('.navbar').removeClass('navbar-transparent').addClass('bg-white');
    }).on('hide.bs.collapse', function() {
      $(this).closest('.navbar').addClass('navbar-transparent').removeClass('bg-white');
    });
  }

  blackDashboard.initMinimizeSidebar();

  $navbar = $('.navbar[color-on-scroll]');
  scroll_distance = $navbar.attr('color-on-scroll') || 500;

  // Check if we have the class "navbar-color-on-scroll" then add the function to remove the class "navbar-transparent" so it will transform to a plain color.
  if ($('.navbar[color-on-scroll]').length != 0) {
    blackDashboard.checkScrollForTransparentNavbar();
    $(window).on('scroll', blackDashboard.checkScrollForTransparentNavbar)
  }

  $('.form-control').on("focus", function() {
    $(this).parent('.input-group').addClass("input-group-focus");
  }).on("blur", function() {
    $(this).parent(".input-group").removeClass("input-group-focus");
  });

  // Activate bootstrapSwitch
  $('.bootstrap-switch').each(function() {
    $this = $(this);
    data_on_label = $this.data('on-label') || '';
    data_off_label = $this.data('off-label') || '';

    $this.bootstrapSwitch({
      onText: data_on_label,
      offText: data_off_label
    });
  });
});

$(document).on('click', '.navbar-toggle', function() {
  var $toggle = $(this);

  if (blackDashboard.misc.navbar_menu_visible == 1) {
    $html.removeClass('nav-open');
    blackDashboard.misc.navbar_menu_visible = 0;
    setTimeout(function() {
      $toggle.removeClass('toggled');
      $('.bodyClick').remove();
    }, 550);

  } else {
    setTimeout(function() {
      $toggle.addClass('toggled');
    }, 580);

    var div = '<div class="bodyClick"></div>';
    $(div).appendTo('body').click(function() {
      $html.removeClass('nav-open');
      blackDashboard.misc.navbar_menu_visible = 0;
      setTimeout(function() {
        $toggle.removeClass('toggled');
        $('.bodyClick').remove();
      }, 550);
    });

    $html.addClass('nav-open');
    blackDashboard.misc.navbar_menu_visible = 1;
  }
});

$(window).resize(function() {
  // reset the seq for charts drawing animations
  seq = seq2 = 0;

  if ($full_screen_map.length == 0 && $('.bd-docs').length == 0) {
    var isExpanded = $navbar.find('[data-toggle="collapse"]').attr("aria-expanded");
    if ($navbar.hasClass('bg-white') && $(window).width() > 991) {
      $navbar.removeClass('bg-white').addClass('navbar-transparent');
    } else if ($navbar.hasClass('navbar-transparent') && $(window).width() < 991 && isExpanded != "false") {
      $navbar.addClass('bg-white').removeClass('navbar-transparent');
    }
  }
});
<script type = "text/javascript"
src = "static/js/jquery-1.3.2.min.js"></script>  
<script type = "text/javascript">  	
//<![CDATA[  
$(init);  
function init(){  
$("#content").hide();
 $("#show").click(showContent);  
 $("#hide").click(hideContent);  
 $("#toggle").click(toggleContent);  

}

function showContent(){  
	$("#content").show();
} // end showContent  
function hideContent(){

$(“#content”).hide();
 } // end hideContent  
 function toggleContent(){  
 $(“#content”).toggle();  
 } // end toggleContent  


blackDashboard = {
  misc: {
    navbar_menu_visible: 0
  },

  initMinimizeSidebar: function() {
    if ($('.sidebar-mini').length != 0) {
      sidebar_mini_active = true;
    }

    $('#minimizeSidebar').click(function() {
      var $btn = $(this);

      if (sidebar_mini_active == true) {
        $('body').removeClass('sidebar-mini');
        sidebar_mini_active = false;
        blackDashboard.showSidebarMessage('Sidebar mini deactivated...');
      } else {
        $('body').addClass('sidebar-mini');
        sidebar_mini_active = true;
        blackDashboard.showSidebarMessage('Sidebar mini activated...');
      }

      // we simulate the window Resize so the charts will get updated in realtime.
      var simulateWindowResize = setInterval(function() {
        window.dispatchEvent(new Event('resize'));
      }, 180);

      // we stop the simulation of Window Resize after the animations are completed
      setTimeout(function() {
        clearInterval(simulateWindowResize);
      }, 1000);
    });
  },

  showSidebarMessage: function(message) {
    try {
      $.notify({
        icon: "tim-icons ui-1_bell-53",
        message: message
      }, {
        type: 'info',
        timer: 4000,
        placement: {
          from: 'top',
          align: 'right'
        }
      });
    } catch (e) {
      console.log('Notify library is missing, please make sure you have the notifications library added.');
    }

  }

};

function hexToRGB(hex, alpha) {
  var r = parseInt(hex.slice(1, 3), 16),
    g = parseInt(hex.slice(3, 5), 16),
    b = parseInt(hex.slice(5, 7), 16);

  if (alpha) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
  } else {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }
}
$( function() {
$( "#sortable" ).sortable({
  revert: true
});
$( "#draggable" ).draggable({
  connectToSortable: "#sortable",
  helper: "clone",
  revert: "invalid"
});
$( "ul, li" ).disableSelection();
} );

</script>
<script>
$('.drag').draggable({ 
  appendTo: 'body',
  helper: 'clone'
});


$('#dropzone').droppable({
  activeClass: 'active',
  hoverClass: 'hover',
  accept: ":not(.ui-sortable-helper)", // Reject clones generated by sortable
  drop: function (e, ui) {
    var $el = $('<div class="drop-item"><details><summary>' + ui.draggable.text() + '</summary><div><label>More Data</label><input type="text" /></div></details></div>');
    $el.append($('<button type="button" class="btn btn-default btn-xs remove"><span class="glyphicon glyphicon-trash"></span></button>').click(function () { $(this).parent().detach(); }));
    $(this).append($el);
  }
}).sortable({
  items: '.drop-item',
  sort: function() {
    // gets added unintentionally by droppable interacting with sortable
    // using connectWithSortable fixes this, but doesn't allow you to customize active/hoverClass options
    $( this ).removeClass( "active" );
  }
});