/* globals define */

define([
  'hybrida/libs/polyfil',
], function(polyfil) {
  'use strict';

  function broadcastEvent(eventName) {
    var evt = polyfil.initCustomEvent(eventName);

    document.dispatchEvent(evt);
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
    if (videoPlayer && videoPlayer.currentChannel !== undefined && videoPlayer.currentChannel) {
      return {
        'Tvservice[onid]': videoPlayer.currentChannel.onid,
        'Tvservice[tsid]': videoPlayer.currentChannel.tsid,
        'Tvservice[sid]': videoPlayer.currentChannel.sid,
        'Tvservice[name]': videoPlayer.currentChannel.name,
        'Tvservice[longname]': videoPlayer.currentChannel.longname,
        'Tvservice[tvchannel_type_id]': typeof videoPlayer.currentChannel.channelType === 'undefined' ? 0:videoPlayer.currentChannel.channelType
      };
    }
    return {};
  }

  // will be refactored!
  function sizeof(object){
    var objects = [object];
    var size    = 0;
    var key;
    var index;
    var processed;
    var search;

    for (index = 0; index < objects.length; index++) {
      switch (typeof objects[index]){
        case 'boolean': size += 4; break;
        case 'number': size += 8; break;
        case 'string': size += 2 * objects[index].length; break;
        case 'object':
          if (!polyfil.isArray(objects[index])) {
            for (key in objects[index]) { size += 2 * key.length; }
          }
          for (key in objects[index]){
            processed = false;
            for (search = 0; search < objects.length; search ++){
              if (objects[search] === objects[index][key]){
                processed = true;
                break;
              }
            }
            if (!processed) { objects.push(objects[index][key]); }
          }
      }
    }
    return size;
  }

  function setKeyset(value) {
    var elemcfg = document.getElementById('oipfcfg');
    var maskValues = {
      RED: 1,
      GREEN: 2,
      YELLOW: 4,
      BLUE: 8,
      NAVIGATION: 16,
      VCR: 32,
      NUMERIC: 256,
    };
    var mask = 0;
    var app;
    var len;
    var i;

    switch(typeof value) {
    case 'number':
      mask = value;
      break;
    case 'undefined':
      mask = parseInt(window.BGITV.env.keyset_mask, 10);
      break;
    default:
      len = value.length;

      for (i = 0; i < len; i++) {
        mask += maskValues[value[i]];
      }
    }

    // for HbbTV 0.5:
    try {
      elemcfg.keyset.value = mask;
    } catch (e) {}
    try {
      elemcfg.keyset.setValue(mask);
    } catch (e) {}

    // for HbbTV 1.0:
    try {
      app = document.getElementById('appmgr').getOwnerApplication(document);
      app.privateData.keyset.setValue(mask);
      app.privateData.keyset.value = mask;
    } catch (e) {}
  }

  window.onload = function() {
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

    broadcastEvent('preSetup');

    initMedia();
    initApp();

    broadcastEvent('postSetup');
  };

  var hasCalledInit = false;
  var timeoutMs = 10000;
  var eventsMaxSize = 1073741824;
  var lastSentIndex = -1;
  var eventsStack = [];
  var ts = new Date().getTime();
  var diffToServerTime;
  var reportsURL;
  var bgitvTimer;

  var helpers = {
    ts: ts,

    setKeyset: setKeyset,

    getCookie: polyfil.getCookie,

    setCookie: polyfil.setCookie,

    jsonp: function(url, callback){
      var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());

      window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
      };
      var script = document.createElement('script');

      //script.type= 'application/javascript';
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
      document.body.appendChild(script);
    },

    sizeof: sizeof,

    broadcastEvent: broadcastEvent,

    getCurrentChannel: getCurrentChannel,

    getServerTime: function() {
      return diffToServerTime + new Date().getTime();
    },
  };

  var analytics = {
    init: function(url) {
      if (! hasCalledInit) {
        reportsURL = url;
        hasCalledInit = true;
        //addServerEventListener();
        send();
      }
    },

    ts: ts,

    eventsPush: function(data) {
      if((sizeof(eventsStack) + sizeof(data)) <= eventsMaxSize && typeof diffToServerTime !== 'undefined'
) {
            data.at = this.getServerTime();
        eventsStack.push(data);
      }
    },
    getServerTime: function() {
      return diffToServerTime + new Date().getTime();
    },

    getCookie: polyfil.getCookie,

    setCookie: polyfil.setCookie,

  };

  /*
  function clearTimer() {
    clearTimeout(analytics.bgitvTimer);
  }

  function addServerEventListener() {
    var container = document.getElementById('announcements-container');
    var source;
    var msLeft;
    var db;
    var timer;
    var msgIds;
    function showAnnounce(id) {
      var el;

      if (! msgIds.length) {
        container.style.display = 'none';
        clearTimeout(timer);
        return;
      }

      if (id === msgIds.length) {
        id = 0;
      }

      el = db[id].Announcement;
      msLeft = typeof el.time_active === 'undefined' ? 2000 : el.time_active;
      container.style.backgroundColor = el.bg_color;
      container.innerHTML = el.text;

      timer = setTimeout(function() {
        showAnnounce(id + 1);
      }, msLeft);
    }


    if (!!window.EventSource) {
      source = new EventSource(window.BGITV_ENV.url.announcements_get);
      source.onmessage = function(e) {
        var data = JSON.parse(e.data);
        var len = data.length;
        var mustUpdate = false;
        var ids = [];
        var el;
        var i;

        for (i = 0; i < len; i++) {
          ids[i] = data[i].Announcement.id;
        }

        db = data;
        msgIds = ids;
        clearTimeout(timer);
        container.style.display = 'block';
        showAnnounce(0);
      };
    }
  }
  */

  function send() {
    var len = eventsStack.length;
    var firstIndex = lastSentIndex + 1;
    var i;
    var str = '';

    for (i = firstIndex; i < len; i++) {
      if (str !== '') {
        str += '&';
      }
      str += 'events[]=' + encodeURIComponent(JSON.stringify(eventsStack[i]));
    }

    lastSentIndex = len - 1;

    helpers.jsonp(reportsURL + (str.length > 0 ? '?' : '') + str,
      function(res) {
        diffToServerTime = parseInt(res.data, 10) - new Date().getTime();
        eventsStack = eventsStack.slice(firstIndex);
      }
    );

    bgitvTimer = setTimeout(function() {
      send();
    }, timeoutMs);
  }

  window.BGITV.analytics = analytics;
  //window.BGITV.helpers = helpers;

  return {
    analytics: analytics,
    helpers: helpers,
  };
  //window.getCurrentChannel = getCurrentChannel;
  //window.sizeof = sizeof;
  //window.setKeyset = setKeyset;
});
