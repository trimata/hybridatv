;(function() {
  'use strict';

  var paths = {
    hybridatv: '../hybridatv/src',
    components: '../components',
    sizzle: '../hybridatv/src/libs/sizzle.min',
  };

  /* test-code */
  paths.sizzle = '../hybridatv/bower_components/' +
    'sizzle/dist/sizzle.min';
  /* test-code-end */

  requirejs.config({
    baseUrl: '.',
    paths: paths,
  });

  requirejs([
    'hybridatv/core/hbbtv',
    'hybridatv/vendors/analytics',
  ], function(hbbtv, analytics) {
    var config = window.HYBRIDATV_ENV();

    hbbtv.bootstrap();

    console.log(config.url.analytics);
    analytics.init(config.url.analytics);
  });

  requirejs(['main']);
})();
