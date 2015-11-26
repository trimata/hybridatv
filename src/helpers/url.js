/* globals define, requirejs */

define([
  'hybridatv/helpers/polyfil',
], function(polyfil) {
  'use strict';

  return {

    queryString: function(params) {
      var parts = [], prop, len, i, el;

      for (prop in params) {
        el = params[prop];
        if (polyfil.isArray(el)) {
          len = el.length;
          for (i = 0; i < len; i++) {
            parts.push(prop + '[]=' + el[i]);
          }
        } else {
          parts.push(prop + '=' + el);
        }
      }

      return parts.join('&');
    },

    //TODO
    isSameOrigin: function() {
      return false;
    },

    getParams: function(str) {
      //TODO crashes if there is no key-value, e.g. index.php?123
      return str ? JSON.parse(
        '{"' + str.replace(/&/g, '","').
        replace(/=/g,'":"') + '"}',
        function(key, value) {
          return key === '' ?
            value : decodeURIComponent(value);
        }) : {};
    },

    getHashData: function(hash) {
      var s = hash.split('/');
      var params = {};
      var len = s.length;
      var i;
      var p;

      for (i = 1; i < len; i++) {
        p = s[i].split(':');
        params[p[0]] = p[1];
      }

      return {
        view: s[0],
        params: params,
      };
    },

    ///////////


    buildHash: function(view, data) {
      var prop;
      var result = '/' + view;

      for (prop in data) {
        if (data.hasOwnProperty(prop)) {
          result += '/' + prop + ':' + data[prop];
        }
      }
      return result;
    },

    path: function(path) {
      return requirejs.toUrl(path);
    },
  };
});
