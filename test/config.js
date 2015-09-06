;(function() {
  'use strict';

  var karma = window.__karma__;
  var testFiles = [];
  var file;

  for (file in karma.files) {
    if (karma.files.hasOwnProperty(file)) {
      if (/test\/spec/i.test(file)) {
        testFiles.push(file);
      }
    }
  }

  function init() {
    document.body.innerHTML += '<object id="appmgr" ' +
      'type="application/oipfApplicationManager" style="position: absolute; ' +
      'left: 0px; top: 0px; width: 0px; height: 0px;"></object>' +
      '<object id="oipfcfg" type="application/oipfConfiguration" ' +
      'style="position: absolute; left: 0px; top: 0px; width: 0px;' +
      ' height: 0px;"></object>';

  }

  require.config({
    baseUrl: '/base/',
    paths: {
      hybridatv: 'src',
      sizzle: 'bower_components/sizzle/dist/sizzle.min',
    },

    deps: testFiles,
    callback: function() {
      init();
      karma.start();
    },
  });

})();
