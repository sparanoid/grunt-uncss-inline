/**
 * grunt-uncss-inline
 * https://github.com/sparanoid/grunt-uncss-inline
 *
 * Copyright (c) 2017-2018 Tunghsiao Liu
 * Licensed under the MIT license.
 */
/**
 * grunt-uncss
 * https://github.com/addyosmani/grunt-uncss
 *
 * Copyright (c) 2016 Addy Osmani
 * Licensed under the MIT license.
 */

'use strict';

const uncss = require('uncss');
const chalk = require('chalk');
const maxmin = require('maxmin');
const jsdom = require('jsdom');

module.exports = function (grunt) {
  grunt.registerMultiTask('uncss_inline', 'Remove unused CSS', function () {
    const done = this.async();
    const options = this.options({
      report: 'min',
      ignore: [/\.js/, /#js/],

      // We need to ignore ALL stylesheets (.css in <link>) in order for this
      // plugin to work properly. Since we're only focus on inlined stylesheets
      // in <style> tags.
      ignoreSheets: [/.*/],

      // uncss_inline specific options
      style_selector: 'style:not([amp-boilerplate]):not([scoped])'
    });

    const { JSDOM } = jsdom;
    const created = {
      files: 0,
      blocks: 0
    };

    this.files.forEach(file => {

      // Get stylesheets from inline <style>
      var dom = new JSDOM(grunt.file.read(file.src));
      var doc = dom.window.document;

      var src = file.src.filter(filepath => {
        if (!grunt.file.exists(filepath)) {
          // Warn on and remove invalid local source files (if nonull was set).
          grunt.log.warn(`Source file ${chalk.cyan(filepath)} not found.`);
          return false;
        } else {
          return true;
        }
      });

      if (src.length === 0 && file.src.length === 0) {
        grunt.fail.warn(`Destination (${file.dest}) not written because src files were empty.`);
      }

      // Store cached file
      created.files++;

      var styles_dom = doc.querySelectorAll(options.style_selector);
      var styles = [];

      if (styles_dom.length) {
        for (var i = 0; i < styles_dom.length; i++) {
          var style = styles_dom[i].textContent;

          if (style) {
            styles.push(style);
            created.blocks++;

            options.raw = styles.join(' ');

            // Remove all inline style tag except the first one
            if (i !== 0) {
              styles_dom[i].remove();
            }
          }
        }
      } else {
        // This is tricky but it works, if no stylesheets found, just throw a
        // blank string to UnCSS to avoid "no stylesheets" error.
        options.raw = ' ';
      }

      try {
        uncss(src, options, (error, output, report) => {
          if (error) {
            throw error;
          }

          if (styles_dom.length) {
            styles_dom[0].textContent = output;
          }

          var html = dom.serialize();
          grunt.file.write(file.dest, html);
          grunt.verbose.writeln(`File ${chalk.cyan(file.dest)} created: ${maxmin(report.original, output, options.report === 'gzip')}`);

          if (typeof options.reportFile !== 'undefined' && options.reportFile.length > 0) {
            grunt.file.write(options.reportFile, JSON.stringify(report));
          }

          done();
        });
      } catch (err) {
        const error = new Error('Uncss failed.');

        if (err.msg) {
          error.message += `, ${err.msg}.`;
        }

        error.origError = err;
        grunt.log.warn(`Uncssing source "${src}" failed.`);
        grunt.fail.warn(error);
      }

    });

    if (created.files > 0) {
      grunt.log.ok(`${created.files} ${grunt.util.pluralize(created.files, 'file/files')} created, ${created.blocks} style ${grunt.util.pluralize(created.blocks, 'block/blocks')} processed.`);
    } else {
      grunt.log.warn('No files created.');
    }
  });
};
