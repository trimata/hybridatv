/* global requirejs */

requirejs.config({
  baseUrl: '.',
  paths: {
    hybridatv: '../hybridatv',
    components: '../components',
    sizzle: '../bower_components/sizzle/dist/sizzle.min',
  },
});

requirejs(['main']);
