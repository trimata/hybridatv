/* globals define, requirejs */

define(function() {
  'use strict';

  return {
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
