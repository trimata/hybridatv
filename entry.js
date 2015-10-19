;(function() {
  'use strict';

  requirejs.config({
    baseUrl: '.',
    paths: {
      hybridatv: '//apps.hybrida.tv/framework/latest/src',
    },
  });

  requirejs([
    'hybridatv/core/hbbtv',
    'hybridatv/vendors/analytics',
  ], function(hbbtv, analytics) {
    var config;

    if (typeof window.HYBRIDATV_CONFIG === 'function') {
      hbbtv.bootstrap();
      config = window.HYBRIDATV_CONFIG();

      analytics.init(config.url.analytics);
      requirejs([config.url.entry]);
    }
  });

}());
