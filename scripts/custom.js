(function($) {
  new WOW().init();

  jQuery(window).load(function() {
    jQuery("#preloader")
      .delay(100)
      .fadeOut("slow");
    jQuery("#load")
      .delay(100)
      .fadeOut("slow");
  });

  //jQuery to collapse the navbar on scroll
  // $(window).scroll(function() {
  // 	if ($(".navbar").offset().top > 50) {
  // 		$(".navbar-fixed-top").addClass("top-nav-collapse");
  // 	} else {
  // 		$(".navbar-fixed-top").removeClass("top-nav-collapse");
  // 	}
  // });

  //jQuery for page scrolling feature - requires jQuery Easing plugin
  $(function() {
    $(".navbar-nav li a").bind("click", function(event) {
      var $anchor = $(this);
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: $($anchor.attr("href")).offset().top
          },
          1500,
          "easeInOutExpo"
        );
      event.preventDefault();
    });
    $(".page-scroll a").bind("click", function(event) {
      var $anchor = $(this);
      $("html, body")
        .stop()
        .animate(
          {
            scrollTop: $($anchor.attr("href")).offset().top
          },
          1500,
          "easeInOutExpo"
        );
      event.preventDefault();
    });
  });

  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btn = document.getElementById("help");

  // Get the <span> element that closes the modal
  var span = document.getElementsByClassName("close")[0];

  // When the user clicks the button, open the modal
  btn.onclick = function() {
    modal.style.display = "block";
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = function() {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
})(jQuery);
