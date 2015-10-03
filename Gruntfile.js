module.exports = function(grunt) {
  'use strict';

  var data = {};
  var newVersion = '';

  grunt.initConfig({

    karma: {
      options:{
        basePath: '.',
        frameworks: ['jasmine', 'requirejs'],
        files: [
          { pattern: 'src/**/*.js', included: false },
          { pattern: 'test/spec/**/*.js', included: false },

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
        files: data,
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
          src: [
            'bower_components/sizzle/**/*.min.js',
            'bower_components/requirejs/**/*.js',
          ],
          dest: 'src/libs/',
        }],
       },
     },

    version: {
      dist: {
        src: ['package.json'],
      },
    },

  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-version');

  grunt.registerTask('test', ['karma']);

  grunt.registerTask('install', function() {
    grunt.task.run([
      'copy:libs',
    ]);

  });

  grunt.registerTask('build', function(arg) {
    var version = grunt.file.readJSON('package.json').version.split('.');
    arg = arg || 'patch';

    switch(arg) {
    case 'major':
      version[0]++;
      version[1] = 0;
      version[2] = 0;
      break;
    case 'minor':
      version[1]++;
      version[2] = 0;
      break;
    default:
      version[2]++;
    }

    newVersion = version.join('.');

    data['dist/' + newVersion + '/'] = [
      'src/**/*.js', 'entry.js',
    ];


    grunt.task.run([
      'test',
      'string-replace:dist',
      'version::' + arg,
    ]);

  });
};
