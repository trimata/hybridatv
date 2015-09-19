define(function() {
  'use strict';

  var media = document.getElementById('media-player');

  function initMedia() {
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
    if (media && media.currentChannel !== undefined &&
    media.currentChannel) {
      return {
        'Tvservice[onid]': media.currentChannel.onid,
        'Tvservice[tsid]': media.currentChannel.tsid,
        'Tvservice[sid]': media.currentChannel.sid,
        'Tvservice[name]': media.currentChannel.name,
        'Tvservice[longname]': media.currentChannel.longname,
        'Tvservice[tvchannel_type_id]': typeof
        media.currentChannel.channelType === 'undefined' ? 0
        : media.currentChannel.channelType
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
