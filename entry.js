requirejs.config({
  baseUrl: '.',
  paths: {
    hybridatv: '../hybridatv/src',
    components: '../components',
    sizzle: '../hybridatv/bower_components/sizzle/dist/sizzle.min',
  },
});

requirejs([
  'hybridatv/core/hbbtv',
  'hybridatv/vendors/analytics',
], function(hbbtv, analytics) {
  'use strict';

  var config = window.HYBRIDATV_ENV();

  hbbtv.bootstrap();

  console.log(config.url.analytics);
  analytics.init(config.url.analytics);
});

requirejs(['main']);
