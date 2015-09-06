define([
], function() {
  'use strict';

  function initMedia() {
    var media = document.getElementById('media-player');

    try {
      media.bindToCurrentChannel();
    } catch (e) {}
    try {
      media.setFullScreen(false);
    } catch (e) {}
  }

  function initApp() {
    var app;
    try {
      app = document.getElementById('appmgr').getOwnerApplication(document);
      app.show();
      app.activate();
    } catch (e) {}
  }


  initMedia();
  initApp();


  return null;
});
