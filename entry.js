;(function() {
  'use strict';

  var _config = window.HYBRIDATV_CONFIG,
      params  = {},
      config;

  if (typeof _config !== 'function') {
    return;
  }

  function getModulePaths(packages) {
    var result = [];
    var i = 0;
    var prop;

    for (prop in packages) {
      result[i++] = packages[prop].path;
    }

    return result;
  }

  config = _config();
  params[config.url.entry] = config;

  requirejs.config({
    baseUrl: '.',
    paths: {
      hybridatv: config.url.framework,
      widgets  : config.url.widgets,
      modules  : config.url.modules,
    },
    packages: getModulePaths(config.packages),
    config: params,
  });

  requirejs([
    'hybridatv/core/hbbtv',
    'hybridatv/vendors/analytics',
  ], function(hbbtv, analytics) {
    hbbtv.bootstrap();

    analytics.init(config.url.analytics);
    requirejs([config.url.entry]);
  });

}());
