define(function() {
  'use strict';

  var media = document.getElementById('media-player');
  var elemcfg = document.getElementById('oipfcfg');
  var appmgr = document.getElementById('appmgr');

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
      app = appmgr.getOwnerApplication(document);
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

  function setKeyset(mask) {
    var app;

    try {
      elemcfg.keyset.value = mask;
    } catch (e) {}

    try {
      elemcfg.keyset.setValue(mask);
    } catch (e) {}

    try {
      app = appmgr.getOwnerApplication(document);
      app.privateData.keyset.setValue(mask);
    } catch (e) {}
  }

  return {
    bootstrap: function() {
      initMedia();
      initApplication();
      setKeyset(0x0);
    },

    getCurrentChannel: getCurrentChannel,

    setKeyset: setKeyset,
  };
});
