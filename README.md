# grunt-uncss-inline [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

[![NPM version](https://img.shields.io/npm/v/grunt-uncss-inline.svg?)](https://www.npmjs.com/package/grunt-uncss-inline)
[![Linux Build Status](https://img.shields.io/travis/sparanoid/grunt-uncss-inline/master.svg?label=Linux%20build)](https://travis-ci.org/sparanoid/grunt-uncss-inline)
[![Windows Build status](https://img.shields.io/appveyor/ci/sparanoid/grunt-uncss-inline/master.svg?label=Windows%20build)](https://ci.appveyor.com/project/sparanoid/grunt-uncss-inline/branch/master)
[![Dependency Status](https://img.shields.io/david/sparanoid/grunt-uncss-inline.svg)](https://david-dm.org/sparanoid/grunt-uncss-inline)
[![devDependency Status](https://img.shields.io/david/dev/sparanoid/grunt-uncss-inline.svg)](https://david-dm.org/sparanoid/grunt-uncss-inline#info=devDependencies)

> A fork of [grunt-uncss](https://github.com/addyosmani/grunt-uncss) doing the exact same thing, but does focus on processing the inline CSS only.

## Getting Started

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the
[Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create
a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins.
Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-uncss-inline --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-uncss-inline');
```

**Issues with the output should be reported on the UnCSS [issue tracker](https://github.com/giakki/uncss/issues).**

**Original usage examples should head to [addyosmani/grunt-uncss](https://github.com/addyosmani/grunt-uncss).**

## Overview

This plugin do the following things:

1. Search all `<style>` tags and combine all the inline CSS into one in the searching order.
2. Pass combined inline CSS to `uncss` for the cleanup.
3. Save cleaned CSS to the first `<style>` found in the DOM.
4. Remove all other processed `<style>` tags.

Example configurations for `Gruntfile.coffee` (all `uncss_inline` specific default options included):

```coffee
uncss_inline:
  options:
    style_selector: 'style:not([amp-boilerplate]):not([scoped])'

  dist:
    files: [
      expand: true
      cwd: "dist/"
      src: "**/*.html"
      dest: "dist/"
    ]
```

## Limitations

Doesn't work well with scoped CSS at the moment.

## Fork Maintainers

- [@sparanoid](http://github.com/sparanoid)

## Original Authors and Maintainers

- [@addyosmani](https://github.com/addyosmani)
- [@XhmikosR](https://github.com/XhmikosR)

## License

(C) Addy Osmani 2016, released under the MIT license
