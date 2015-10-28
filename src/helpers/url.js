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

    getParams: function(str) {
      return str ? JSON.parse(
        '{"' + str.replace(/&/g, '","').
        replace(/=/g,'":"') + '"}',
        function(key, value) {
          return key === '' ?
            value : decodeURIComponent(value);
        }) : {};
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

    parseHash: function(str) {
      var data = { params: {}, view: '', };
      var segments;
      var len;
      var pieces;
      var i;

      if (typeof str !== 'string') {
        str = window.location.hash;
      }

      segments = str.split('/');
      len = segments.length;

      for (i = 2; i < len; i++) {
        pieces = segments[i].split(':');

        data.params[pieces[0]] = pieces[1];
      }

      data.tmp = segments[1];

      return data;
    },

    path: function(path) {
      return requirejs.toUrl(path);
    },
  };
});
