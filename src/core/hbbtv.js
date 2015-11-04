define(function() {
  'use strict';

  var currentKeyset = -1;
  var media;
  var elemcfg;
  var appmgr;

  function initPlayer(player) {
    try {
      player.bindToCurrentChannel();
    } catch (e) {}
    try {
      player.setFullScreen(false);
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

    if (currentKeyset === mask) {
      return;
    }

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

    currentKeyset = mask;
  }

  return {
    config: function(cfg) {
      media = document.getElementById(cfg.player);
      elemcfg = document.getElementById(cfg.oipfcfg);
      appmgr = document.getElementById(cfg.appmgr);

      return this;
    },

    bootstrap: function() {
      initPlayer(media);
      initApplication();
      setKeyset(0x0);
    },

    getCurrentChannel: getCurrentChannel,

    setKeyset: setKeyset,
  };
});
