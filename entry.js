;(function() {
  'use strict';

  var paths = {
    hybridatv: 'http://apps.hybrida.tv/framework/latest/src',
  };

  requirejs.config({
    baseUrl: '.',
    paths: paths,
  });

  requirejs([
    'hybridatv/core/hbbtv',
    'hybridatv/vendors/analytics',
  ], function(hbbtv, analytics) {
    var config = window.HYBRIDATV_CONFIG();

    hbbtv.bootstrap();
    analytics.init(config.url.analytics);
  });

  requirejs(['main']);
})();