/* global requirejs */

requirejs.config({
  baseUrl: '.',
  paths: {
    hybridatv: '../hybridatv/src',
    components: '../components',
    sizzle: './bower_components/sizzle/dist/sizzle.min',
  },
});

requirejs([
  'hybridatv/core/bootstrap',
  'hybridatv/vendors/analytics',
  'main',
]);
