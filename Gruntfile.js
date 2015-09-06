module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({

    karma: {
      options:{
        basePath: '.',
        frameworks: ['jasmine', 'requirejs'],
        files: [
          { pattern: 'src/**/*.js', included: false },
          { pattern: 'test/spec/**/*.js', included: false },
          { pattern: 'bower_components/requirejs/**/*.js', included: false },
          { pattern: 'bower_components/sizzle/**/*.js', included: false },

          'test/config.js'
        ],

        autoWatch: true,
        reporters: ['dots'],
        reportSlowerThan: 3000,
        logLevel: 'ERROR',

        browsers: [
          'PhantomJS',
        ]
      },

      unit: {
        singleRun: true,
      },

    },

    jsdoc: {
      dist: {
        src: ['src/**/*.js'],
        options: {
          destination: 'docs',
        }
      }
    },

  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');

  grunt.registerTask('test', ['karma']);

  /*
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('build', [
    'clean',
    'copy',
  ]);
  */

};
