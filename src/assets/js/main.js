$(function() {
  hljs.initHighlighting();

  $('a[href^="#"]').on('click', function(e) {
    gotoTarget(e, $(this).attr('href'));
  });

  gotoTarget();

  function gotoTarget(e, anchor) {
    var offset;
    if(anchor) {
      offset = $(anchor).offset();
    } else {
      offset = $(':target').offset();
    }
    if(offset) {
      var $header = $('.page-top');
      var position = $header.css('position');
      if(position === 'sticky' || position === 'fixed') {
        var height = $header.height();
        var scrollTo = offset.top - height - 12; // minus fixed header height
        $('html, body').scrollTop(scrollTo);
        e ? e.preventDefault() : null;
      }
    }
  }
});
