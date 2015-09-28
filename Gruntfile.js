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
          'dist/': ['src/**/*.js', 'entry.js'],
        },
        options: {
          replacements: [{
            pattern: new RegExp('\\n?(\/\\*\\s+)test-code(\\s+\\*\\/)' +
              '[\\s\\S]*?\\1test-code-end\\2', 'mg'),
            replacement: '',
          },
          {
            pattern: /\n?\s*console.+/g,
            replacement: '',
          }, ]
        }
      }
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

    copy: {
      libs: {
        files: [
         {
           flatten: true,
           expand: true,
           src: ['bower_components/sizzle/**/*.min.js'],
           dest: 'dist/src/libs/',
         },
        ],
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
    'string-replace:dist',
    'copy',
  ]);

};
