define([
  'hybridatv/helpers/async',
  'hybridatv/helpers/polyfil',
], function(async, polyfil) {
  'use strict';

  var hasCalledInit = false;
  var lastSentIndex = -1;
  var eventsMaxSize = 1073741824;
  var events = [];
  var ts = new Date().getTime();
  var diffToServerTime;
  var timeoutMs;
  var reportsURL;
  var analytics;
  var bgitvTimer;

  function sizeof(object) {
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

  function send() {
    var len = events.length;
    var firstIndex = lastSentIndex + 1;
    var str = '';
    var i;

    for (i = firstIndex; i < len; i++) {
      if (str !== '') {
        str += '&';
      }
      str += 'events[]=' + encodeURIComponent(JSON.stringify(events[i]));
    }

    lastSentIndex = len - 1;

    async.jsonp(reportsURL + (str.length > 0 ? '?' : '') + str,
    {}, function(res) {
        diffToServerTime = parseInt(res.data, 10) - new Date().getTime();
        events = events.slice(firstIndex);
      }
    );

    bgitvTimer = setTimeout(function() {
      send();
    }, timeoutMs);
  }

  analytics = {
    init: function(url, time) {
      if (hasCalledInit) { return; }

      timeoutMs = time || 10000;
      reportsURL = url;
      hasCalledInit = true;
      send();
    },

    ts: ts,

    eventsPush: function(data) {
      if ((sizeof(events) + sizeof(data)) <= eventsMaxSize &&
      typeof diffToServerTime !== 'undefined') {
        data.at = this.getServerTime();
        events.push(data);
      }
    },

    getServerTime: function() {
      return diffToServerTime + new Date().getTime();
    },
  };

  return analytics;
});
