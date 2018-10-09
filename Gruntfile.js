/*
 * grunt-uncss-inline
 * https://github.com/sparanoid/grunt-uncss-inline
 *
 * Copyright (c) 2016 Tunghsiao Liu
 * Licensed under the MIT license.
 */
/*
 * grunt-uncss
 * https://github.com/addyosmani/grunt-uncss
 *
 * Copyright (c) 2016 Addy Osmani
 * Licensed under the MIT license.
 */

'use strict';

/* jshint indent: 2 */

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt, { scope: 'devDependencies' });
  require('time-grunt')(grunt);

  // Project configuration.
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= simplemocha.test.src %>'
      ]
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp', 'dist', 'tests/output.css']
    },

    uncss_inline: {
      dist: {
        src: ['tests/app/about.html', 'tests/app/contact.html', 'tests/app/index.html'],
        dest: 'dist/css/tidy.css'
      },
      test: {
        files: {
          'tests/output.css': 'tests/index.html'
        },
        options: {
          report: 'gzip'
        }
      },
      testMany: {
        files: {
          'tests/output.css': 'tests/index.html',
          'tests/output2.css': 'tests/index2.html',
        },
        options: {
          report: 'gzip'
        }
      },
      testUncssrc: {
        files: {
          'tests/output.css': 'tests/index.html'
        },
        options: {
          uncssrc: 'tests/.uncssrc'
        }
      },
      testSvg: {
        files: {
          'tests/index3.ouput.html': 'tests/index3.html'
        },
        options: {
          uncssrc: 'tests/.uncssrc'
        }
      }
    },

    // Unit tests.
    simplemocha: {
      test: {
        src: 'tests/selectors.js'
      }
    },

    connect: {
      server: {
        options: {
          base: 'tests',
          port: 3000
        }
      }
    },

    watch: {
      files: ['Gruntfile.js', 'tasks/**/*.js', 'test/**/*.*'],
      tasks: ['jshint', 'test']
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: 'angular'
        }
      },
      dist: {
        src: 'CHANGELOG.md'
      }
    },

    bump: {
      options: {
        files: ['package.json'],
        commitMessage: 'chore: release v%VERSION%',
        commitFiles: ['-a'],
        tagMessage: 'chore: create tag %VERSION%',
        push: false
      }
    },

    'npm-contributors': {
      options: {
        commitMessage: 'chore: update contributors'
      }
    }
  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  grunt.registerTask('test', [
    'jshint',
    'uncss_inline:test',
    'uncss_inline:testMany',
    'uncss_inline:testUncssrc',
    'uncss_inline:testSvg',
    'simplemocha'
  ]);

  grunt.registerTask('dev', [
    'test',
    'connect',
    'watch'
  ]);

  grunt.registerTask('release', 'bump, changelog and publish to npm.', function(type) {
    grunt.task.run([
      'npm-contributors',
      'bump:' + (type || 'patch') + ':bump-only',
      'conventionalChangelog',
      'bump-commit',
      'npm-publish'
    ]);
  });

  // By default, lint and run all tests.
  grunt.registerTask('default', [
    'test'
  ]);

};
