var test = require('tape');
var xtend = require('xtend');

var fixture = require('../fixture.js');

module.exports =  function(options) {
  'use strict';

  var inlineSourceMapComment = options.main;

  test('inlineSourceMapComment on ' + options.environment, function(t) {
    var expected = '//' + fixture.base64;

    t.plan(5);

    t.equal(
      inlineSourceMapComment(fixture.json),
      expected,
      'should create a base64-encoded source map from an object.'
    );

    t.equal(
      inlineSourceMapComment(JSON.stringify(fixture.json)),
      expected,
      'should create a base64-encoded source map from a string.'
    );

    t.equal(
      inlineSourceMapComment(xtend(fixture.json, {sourcesContent: 'foo'})),
      expected,
      'should remove `sourcesContent` property.'
    );

    t.throws(
      function() {
        inlineSourceMapComment('');
      },
      /SyntaxError/,
      'should throw a syntax error when it takes non-JSON string.'
    );

    t.throws(
      function() {
        inlineSourceMapComment();
      },
      /TypeError/,
      'should throw a type error when it doesn\'t take any arguments.'
    );
  });

  test('inlineSourceMapComment.js on ' + options.environment, function(t) {
    t.plan(1);

    t.strictEqual(
      inlineSourceMapComment.js,
      inlineSourceMapComment,
      'should be equal to inlineSourceMapComment.'
    );
  });

  test('inlineSourceMapComment.css on ' + options.environment, function(t) {
    var expected = '/* ' + fixture.base64 + ' */';

    t.plan(1);

    t.equal(
      inlineSourceMapComment.css(fixture.json),
      expected,
      'should create a block comment.'
    );
  });
};
