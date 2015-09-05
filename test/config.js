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

  require.config({
    baseUrl: '/base/',
    paths: {
      hybridatv: 'src',
      sizzle: 'bower_components/sizzle/dist/sizzle.min',
    },

    deps: testFiles,
    callback: karma.start,
  });

})();