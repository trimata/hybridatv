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

  function initApplication() {
    var app;
    try {
      app = document.getElementById('appmgr').getOwnerApplication(document);
      app.show();
      app.activate();
    } catch (e) {}
  }

  function getCurrentChannel() {
    var objs = document.getElementsByTagName('object');
    var videoPlayer;
    var i;

    for (i=0; i < objs.length; i++){
      if(objs[i].type === 'video/broadcast') {
        videoPlayer = objs[i];
        break;
      }
    }
    if (videoPlayer && videoPlayer.currentChannel !== undefined &&
    videoPlayer.currentChannel) {
      return {
        'Tvservice[onid]': videoPlayer.currentChannel.onid,
        'Tvservice[tsid]': videoPlayer.currentChannel.tsid,
        'Tvservice[sid]': videoPlayer.currentChannel.sid,
        'Tvservice[name]': videoPlayer.currentChannel.name,
        'Tvservice[longname]': videoPlayer.currentChannel.longname,
        'Tvservice[tvchannel_type_id]': typeof
        videoPlayer.currentChannel.channelType === 'undefined' ? 0
        : videoPlayer.currentChannel.channelType
      };
    }
    return {};
  }

  return {
    bootstrap: function() {
      initMedia();
      initApplication();
    },

    getCurrentChannel: getCurrentChannel,
  };
});
