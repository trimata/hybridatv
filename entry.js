/* global requirejs */

requirejs.config({
  baseUrl: '.',
  paths: {
    hybrida: '../hybrida',
    components: '../components',
    sizzle: '../bower_components/sizzle/dist/sizzle.min',
  },
});

requirejs(['main']);