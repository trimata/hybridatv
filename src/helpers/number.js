define(function() {
  'use strict';

  return {
    inRange: function(n, min, max) {
      return Math.min(max, Math.max(min, n));
    },
  };

});
