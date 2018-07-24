/**
 * grunt-uncss-inline
 * https://github.com/sparanoid/grunt-uncss-inline
 *
 * Copyright (c) 2017 Tunghsiao Liu
 * Licensed under the MIT license.
 */
/**
 * grunt-uncss
 * https://github.com/addyosmani/grunt-uncss
 *
 * Copyright (c) 2016 Addy Osmani
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

  'use strict';

  var uncss = require('uncss'),
    chalk = require('chalk'),
    maxmin = require('maxmin'),
    async = require('async'),
    jsdom = require('jsdom');

  var { JSDOM } = jsdom;

  grunt.registerMultiTask('uncss_inline', 'Remove unused CSS', function() {
    var style_selector = 'style:not([amp-boilerplate])';

    var done = this.async();
    var options = this.options({
      report: 'min',
      ignore: [/\.js/, /#js/],
      // We need to ignore ALL stylesheets (.css in <link>) in order for this
      // plugin to work properly. Since we're only focus on inlined stylesheets
      // in <style> tags.
      ignoreSheets: [/.*/]
    });

    function processFile(file, done) {
      // Create a local options instance in order to not affect other files.
      var local_options = Object.assign({}, options);

      // Get stylesheets from inline <style>
      var dom = new JSDOM(grunt.file.read(file.src));
      var doc = dom.window.document;

      var src = file.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file ' + chalk.cyan(filepath) + ' not found.');
          return false;
        } else {
          return true;
        }
      });

      if (src.length === 0 && file.src.length === 0) {
        grunt.fail.warn('Destination (' + file.dest + ') not written because src files were empty.');
      }

      var styles_dom = doc.querySelectorAll(style_selector);
      var styles = [];

      if (styles_dom.length) {
        for (var i = 0; i < styles_dom.length; i++) {
          var style = styles_dom[i].textContent;

          if (style) {
            styles.push(style);
            local_options.raw = styles.join(' ');

            // Remove all inline style tag except the first one
            if (i !== 0) {
              styles_dom[i].remove();
            }
          }
        }
      } else {
        // This is tricky but it works, if no stylesheets found, just throw a
        // blank string to UnCSS to avoid "no stylesheets" error.
        local_options.raw = ' ';
      }

      try {
        uncss(src, local_options, function(error, output, report) {
          if (error) {
            throw error;
          }

          if (styles_dom.length) {
            styles_dom[0].textContent = output;
          }

          var html = dom.serialize();
          grunt.file.write(file.dest, html);

          grunt.log.writeln('File ' + chalk.cyan(file.dest) + ' created: ' + maxmin(report.original, output, local_options.report === 'gzip'));
          if (typeof(local_options.reportFile) !== 'undefined' && local_options.reportFile.length > 0) {
            grunt.file.write(local_options.reportFile, JSON.stringify(report));
          }
          done();
        });
      } catch (e) {
        var err = new Error('Uncss failed.');
        if (e.msg) {
          err.message += ', ' + e.msg + '.';
        }
        err.origError = e;
        grunt.log.warn('Uncssing source "' + src + '" failed.');
        grunt.fail.warn(err);
      }

    }

    if (this.files.length === 1) {
      processFile(this.files[0], done);
    } else {
      // Processing multiple files must be done sequentially
      // until https://github.com/giakki/uncss/issues/136 is resolved.
      async.eachSeries(this.files, processFile, done);
    }

  });

};
