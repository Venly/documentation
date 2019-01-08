$(function() {
  hljs.initHighlighting();

  if(window.innerWidth >= 1024) {
    if(Waypoint) {
      var sticky = new Waypoint.Sticky({
        element: $('#toc')[0],
        wrapper: false
      });
    }
  }
});
