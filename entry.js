/* global requirejs */

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

  hbbtv.bootstrap();

  analytics.init(env.analyticsURL);
});

requirejs(['main']);
