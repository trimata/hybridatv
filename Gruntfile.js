module.exports = function(grunt) {
  'use strict';

  var data = {};

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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

    exec: {
      tag: {
        cmd: function(msg) {
          return [
            'git commit -a -m "' + msg + '"',
            'version=$(ls -t dist | head -1);git tag v$version',
          ].join(' && ');
        },
      }
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-version');
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('test', ['karma']);

  grunt.registerTask('install', function() {
    grunt.task.run([
      'copy:libs',
    ]);

  });

  grunt.registerTask('build', function(arg, buildSuffix) {
    var version = getVersion();
    var newVersion;

    buildSuffix = buildSuffix ? '' : '-build';

    switch(arg) {
    case 'major':
      version.major++;
      version.minor = 0;
      version.patch = 0;
      break;
    case 'minor':
      version.minor++;
      version.patch = 0;
      break;
    default:
      version.patch++;
    }

    newVersion = version.toString();

    data['dist/' + newVersion + buildSuffix + '/'] = [
      'src/**/*.js', 'entry.js',
    ];

    grunt.task.run([
      'test',
      'string-replace:dist',
      'version:dist:' + newVersion,
    ]);
  });

  function getVersion() {
    var parts = grunt.config('pkg').version.split('.');

    return {
      major: parts[0],
      minor: parts[1],
      patch: parts[2],
      toString: function() {
        return this.major + '.' + this.minor + '.' + this.patch;
      },
    };
  }

  grunt.registerTask('deploy', function() {
    var msg = grunt.option('message');
    var type = grunt.option('type');


    grunt.task.run([
      'build:' + type + ':b',
      'exec:tag:' + msg,
    ]);

  });
};
