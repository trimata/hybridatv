;(function() {
  'use strict';

  var paths = {
    hybridatv: '../hybridatv/src',
  };

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
