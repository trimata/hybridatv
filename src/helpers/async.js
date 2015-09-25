define([
  'hybridatv/libs/polyfil',
], function(polyfil) {
  'use strict';

  var uniqueId = 0;

  function buildQueryString(params) {
    var queryString = '';
    var prop;
    var len;
    var el;
    var i;

    for (prop in params) {
      el = params[prop];
      if (polyfil.isArray(el)) {
        len = el.length;
        for (i = 0; i < len; i++) {
          queryString += prop + '[]=' + el[i] + '&';
        }
      } else {
        queryString += prop + '=' + el + '&';
      }
    }

    return queryString.slice(0, queryString.length - 1);
  }

  return {
    buildQueryString: buildQueryString,
    load: function(type, url, params, success, error) {
      var request = new XMLHttpRequest();
      var queryString = buildQueryString(params);
      var headers = [];
      var args = [];
      var len;
      var el;
      var i;

      switch(type) {
      case 'POST':
        headers.push({
          name: 'Content-type',
          val: 'application/x-www-form-urlencoded',
        });
        args.push(queryString);
        break;
      case 'GET':
        if (queryString.length) {
          url += '?' + queryString;
        }
        break;
      }

      request.open(type, url, true);

      request.onreadystatechange = function() {
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

      len = headers.length;

      for (i = 0; i < len; i++) {
        el = headers[i];
        request.setRequestHeader(el.name, el.val);
      }

      request.send.apply(request, args);
    },

    jsonp: function(url, params, callback, context) {
      var name = '_jsonp_callback_' + (uniqueId++);
      var script = document.createElement('script');
      var head = document.getElementsByTagName('head')[0];
      var queryString;

      params.callback = name;
      queryString = buildQueryString(params);

      script.type = 'text/javascript';
      script.src = url +
        url.indexOf('?') > -1 ? '&' : '?' + queryString;

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
      var i;
      var iterDown = function() {
        if (! --count) {
          callback();
        }
      };

      for (i = 0; i < len; i++) {
        fns[i](iterDown);
      }
    },

    get: function(url, data, success, error) {
      this.load('GET', url, data, success, error);
    },

    post: function(url, data, success, error) {
      this.load('POST', url, data, success, error);
    },
  };
});
