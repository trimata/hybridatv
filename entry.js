/* global requirejs */

requirejs.config({
  baseUrl: '.',
  paths: {
    hybridatv: '../hybridatv/src',
    components: '../components',
    sizzle: './bower_components/sizzle/dist/sizzle.min',
  },
});

requirejs([
  'hybridatv/core/hbbtv',
  'hybridatv/vendors/analytics',
], function(hbbtv, analytics) {
  'use strict';

  hbbtv.bootstrap();

  analytics.init();
});

requirejs(['main']);
