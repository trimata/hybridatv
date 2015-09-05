/* globals define */

define([
  'hybrida/libs/polyfil',
  'hybrida/helpers/url',
], function(polyfil, url) {
  'use strict';

  var head = document.getElementsByTagName('head')[0];

  /**
   */
  return {
    /**
     * @method css
     */
    css: function(fileName) {
      var cssNode = document.createElement('link');

      polyfil.extend(cssNode, {
        type: 'text/css',
        rel: 'stylesheet',
        href: url.path(fileName + '.css'),
      });

      head.appendChild(cssNode);
    },
    /**
     * @method js
     */
    js: function(fileName) {
      var el = document.createElement('script');

      el.src = fileName;
      document.body.appendChild(el);
    },
  };
});
