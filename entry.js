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
  'hybridatv/env',
], function(hbbtv, analytics, env) {
  'use strict';

  var config = env();

  hbbtv.bootstrap();

  analytics.init(config.analyticsURL);
});

requirejs(['main']);
