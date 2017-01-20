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

module.exports = function ( grunt ) {

  'use strict';

  var uncss   = require( 'uncss' ),
      chalk   = require( 'chalk' ),
      maxmin  = require( 'maxmin' ),
      async   = require( 'async' ),
      cheerio = require( 'cheerio' );

  grunt.registerMultiTask( 'uncss_inline', 'Remove unused CSS', function () {

    var done = this.async();
    var options = this.options({
      report: 'min',
      ignore: [/\.js/, /#js/],
      // We need to ignore ALL stylesheets (.css in <link>) in order for this
      // plugin to work properly. Since we're only focus on inlined stylesheets
      // in <style> tags.
      ignoreSheets: [/.*/]
    });

    function processFile ( file, done ) {

      // Get stylesheets from inline <style>
      var $ = cheerio.load(grunt.file.read(file.src), {
        decodeEntities: false
      });

      var src = file.src.filter(function ( filepath ) {
        // Warn on and remove invalid source files (if nonull was set).
        if ( !grunt.file.exists( filepath ) ) {
          grunt.log.warn( 'Source file ' + chalk.cyan( filepath ) + ' not found.' );
          return false;
        } else {
          return true;
        }
      });

      if ( src.length === 0 && file.src.length === 0 ) {
        grunt.fail.warn( 'Destination (' + file.dest + ') not written because src files were empty.' );
      }

      var styles = [];
      if ($('style').length) {
        $('style').each(function () {
          var style = $(this).html();
          if (style) {
            styles.push(style);
            options.raw = styles.join(' ');
          }
        });
      } else {
        // This is tricky but it works, if no stylesheets found, just throw a
        // blank string to UnCSS to avoid "no stylesheets" error.
        options.raw = ' ';
      }

      try {
        uncss( src, options, function ( error, output, report ) {
          if ( error ) {
            throw error;
          }

          // remove all `<style>` tags except the first one
          $('style').slice(1).remove();
          $('style').text(output);
          var html = $.html();
          grunt.file.write( file.dest, html );

          grunt.log.writeln('File ' + chalk.cyan( file.dest ) + ' created: ' + maxmin( report.original, output, options.report === 'gzip' ) );
          if (typeof(options.reportFile) !== 'undefined' && options.reportFile.length > 0) {
            grunt.file.write(options.reportFile, JSON.stringify(report));
          }
          done();
        });
      } catch ( e ) {
        var err = new Error( 'Uncss failed.' );
        if ( e.msg ) {
          err.message += ', ' + e.msg + '.';
        }
        err.origError = e;
        grunt.log.warn( 'Uncssing source "' + src + '" failed.' );
        grunt.fail.warn( err );
      }

    }

    if (this.files.length === 1) {
      processFile( this.files[0], done );
    } else {
      // Processing multiple files must be done sequentially
      // until https://github.com/giakki/uncss/issues/136 is resolved.
      async.eachSeries( this.files, processFile, done );
    }

  });

};
