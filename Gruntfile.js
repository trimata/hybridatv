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
        reportSlowerThan: 3000,
        logLevel: 'ERROR',

        browsers: [
          'PhantomJS',
        ],

        reporters: ['progress', 'coverage'],

        preprocessors: {
          'src/**/*.js': ['coverage']
        },

        coverageReporter: {
          type : 'html',
          dir : 'coverage/'
        },

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

    clean: {
      dist: {
        src: ['dist'],
      },
    },

    'string-replace': {
      dist: {
        files: {
          'dist/': 'src/**/*.js',
        },
        options: {
          replacements: [{
            pattern: /(\/\*\s+)test-code(\s+\*\/)[\s\S]*?\1test-code-end\2/mg,
            replacement: '',
          },
          {
            pattern: /console.+;/g,
            replacement: '',
          }, ]
        }
      }
    },

    copy: {
      dist: {
        files: [
          { expand: true, src: ['src/**'], dest: 'dist/', },
          { expand: true, src: 'entry.js', dest: 'dist/', },
          { expand: true, src: ['bower_components/**'], dest: 'dist/', },
        ],
      },
    },

    watch: {
      test: {
        files: [
          'test/spec/**/*Spec.js',
          'src/**/*.js',
        ],
        tasks: ['test'],
      },
    },

  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');

  grunt.registerTask('test', ['karma']);

  grunt.registerTask('build', [
    'clean:dist',
    'copy:dist',
    'string-replace:dist',
  ]);

};
