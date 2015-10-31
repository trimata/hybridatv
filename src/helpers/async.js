define([
  'hybridatv/helpers/url',
], function(url) {
  'use strict';

  var uniqueId = 0;
  var voidFn = function() {};
  var head = document.getElementsByTagName('head')[0];

  return {

    get: function(path) {
      var data;
      var success;
      var error;
      var queryString;

      if (typeof arguments[1] === 'function') {

        //allows passing only path and success callback
        error = arguments[2];
        success = arguments[1];
        data = {};
      } else {

        // allows passing only path
        data = arguments[1] || {};
      }

      queryString = url.queryString(data);

      if (queryString.length) {
        path += (path.indexOf('?') > -1 ? '&' : '?') + queryString;
      }

      this.request(path, 'get', [], '', success, error);
    },

    post: function(path, data, success, error) {
      this.request(path, 'post', [{
        name: 'Content-type',
        val: 'application/x-www-form-urlencoded',
      }], url.queryString(data), success, error);
    },

    request: function(path, type, headers, data, success, error) {
      var req = new XMLHttpRequest();
      var len = headers.length;
      var i;
      var el;

      req.open(type, path, true);

      req.onreadystatechange = function() {
        if (this.readyState === 4) {
          if (this.status === 200) {
            if (typeof success === 'function') {
              success(this.responseText);
            }
          } else if (typeof error === 'function') {
            error(this);
          }
        }
      };

      for (i = 0; i < len; i++) {
        el = headers[i];
        req.setRequestHeader(el.name, el.val);
      }

      req.send(data);
    },

    json: function(path, data, callback, error) {
      if (url.isSameOrigin(path, window.location.origin)) {
        this.get(path, data, function(r) {
          callback(JSON.parse(r));
        }, error);
      } else {
        this.jsonp(path, data, callback);
      }
    },

    jsonp: function(path, data, callback, context) {
      var name = '_jsonp_callback_' + (uniqueId++);
      var script = document.createElement('script');
      var queryString;

      callback = callback || voidFn;

      data.callback = name;
      queryString = url.queryString(data);

      script.type = 'text/javascript';
      script.src = path +
        (path.indexOf('?') > -1 ? '&' : '?') + queryString;

      window[name] = function(data) {
        callback.call((context || window), data);
        head.removeChild(script);
        script = null;
        delete window[name];
      };

      head.appendChild(script);
    },

    parallel: function(fns, callback) {
      var len = fns.length;
      var count = len;
      var iterDown = function() {
        if (--count <= 0) {
          callback();
        }
      };
      var i;

      for (i = 0; i < len; i++) {
        fns[i](iterDown);
      }
    },

  };
});
