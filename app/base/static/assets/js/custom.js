//menu toggle
$('.menu-toggle').on('click', function (e) {
  $('body').toggleClass("active-responsive-menu");
});


//slick slider multiple for gallery
$(".hero-slider").slick({
  slidesToShow: 2,
  slidesToScroll: 1,
  arrows: true,
  dots: false,
  responsive: [
    {
      breakpoint: 768,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
      }
    }
  ]
});

$('.grid').imagesLoaded( function() { // it will load the image of isotope 
//isotope
var $grid = $('.grid');
$grid.isotope({
  itemSelector: '.grid-item',
  percentPosition: true,
  masonry: {
    columnWidth: '.grid-sizer',
    gutter: '.gutter-sizer',
  }
});
$('.filter button').on('click', function () {
  var value = $(this).attr('data-name');
  $grid.isotope({
    filter: value
  });
});
});


//isotope filtering button active
$('.filter-active button').click(function () {
  $('.filter-active button').removeClass('active-filter');
  $(this).addClass('active-filter');
});

//sticky
$(document).on("scroll", function () {
  if ($(document).scrollTop()) {
    $('.header-wrapper').addClass('active_sticky');
  }
  else {
    $('.header-wrapper').removeClass('active_sticky');
  }
})


// Hide header on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('.header-wrapper').outerHeight();

$(window).scroll(function (event) {
  didScroll = true;
});

setInterval(function () {
  if (didScroll) {
    hasScrolled();
    didScroll = false;
  }
}, 0);

function hasScrolled() {
  var st = $(this).scrollTop();

  // Make scroll more than delta
  if (Math.abs(lastScrollTop - st) <= delta)
    return;

  // If scrolled down and past the navbar, add class .nav-up.
  if (st > lastScrollTop && st > 0) {
    // Scroll Down
    $('.header-wrapper').removeClass('nav-down').addClass('nav-up');
  } else {
    // Scroll Up
    if (st + $(window).height() < $(document).height()) {
      $('.header-wrapper').removeClass('nav-up').addClass('nav-down');
    }
  }

  lastScrollTop = st;
}

//back-to-top
$(window).scroll(function () {
  if ($(this).scrollTop()) {
    $('.back-top-arrow').fadeIn();
    $(".back-top-arrow").css("opacity", "1");
    $(".back-top-arrow").css("visibility", "visible");
  } else {
    $('.back-top-arrow').fadeOut();
  }
});

//spinner loader

$(window).on('load', function () {
  $(".page-preloader").css("opacity", "0");
  $(".page-preloader").css("transition", "0.5s ease");
  $(".page-preloader").css("z-index", "-1");
  // $("body").css("overflow", "auto");
  // animation wow // after preloader wow.js will start
  new WOW().init();
});



