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
      commit: {
        cmd: function(msg) {
          return 'git add -A; git commit -m "' + msg + '"';
        }
      },

      tag: {
        cmd: function(version) {
          return 'git tag v' + version;
        },
      },

      transfer: {
        cmd: function(version, dir) {
          return 'cp -rnv dist/' + version + ' ' + dir;
        }
      },

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

  grunt.registerTask('setup', function() {
    grunt.task.run([
      'copy:libs',
    ]);

  });

  grunt.registerTask('build', function(update, buildSuffix) {
    var newVersion = /^\d+\.\d+\.\d+$/.test(update) ?
      update : getNextVersion(getVersion(), update);

    buildSuffix = buildSuffix ? '' : '-build';

    data['dist/' + newVersion + buildSuffix + '/'] = [
      'src/**/*.js', 'entry.js',
    ];

    grunt.task.run([
      'test',
      'version:dist:' + newVersion,
      'string-replace:dist',
    ]);
  });

  function getVersion() {
    return grunt.config('pkg').version;
  }

  function getNextVersion(version, update) {
    var parts = version.split('.');

    switch(update) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    default:
      parts[2]++;
    }

    return parts.join('.');
  }

  grunt.registerTask('deploy', function() {
    var dir = grunt.option('dir'); 
    var tag = grunt.option('tag');
    var newVersion = getNextVersion(getVersion(), grunt.option('update'));
    var msg = grunt.option('message') || 'Update to v' + newVersion;
    var tasks = [
      'build:' + newVersion + ':no-suffix',
      'exec:commit:' + msg,
    ];

    if (dir) {
      tasks.push('exec:transfer:' + newVersion + ':' + dir);
    }

    if (tag) {
      tasks.push('exec:tag:' + newVersion);
    }

    grunt.task.run(tasks);

  });
};
