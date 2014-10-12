var test = require('tape');
var xtend = require('xtend');

var mapData = {
  version: 3,
  file: 'bars.js.map',
  sources: ['foo.js'],
  names: [],
  mappings: 'AAAA'
};

var mapBase64 = '# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycy5qcy5tYXAiLCJzb3VyY2VzIjpbImZvby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSJ9';

var mapDataWithSourcesContent = xtend(mapData, {sourcesContent: ['0']});

var mapBase64WithSourcesContent = '# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycy5qcy5tYXAiLCJzb3VyY2VzIjpbImZvby5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZXNDb250ZW50IjpbIjAiXX0=';

module.exports =  function(options) {
  'use strict';

  var inlineSourceMapComment = options.main;

  test('inlineSourceMapComment on ' + options.environment, function(t) {

    t.plan(10);

    t.equal(
      inlineSourceMapComment(mapData),
      '//' + mapBase64,
      'should create a base64-encoded source map from an object.'
    );

    var newMapData = xtend({}, mapData);
    inlineSourceMapComment(newMapData, {sourcesContent: false});

    t.deepEqual(
      newMapData, mapData,
      'should not modify the object of its first argument.'
    );

    t.equal(
      inlineSourceMapComment(JSON.stringify(mapData)),
      '//' + mapBase64,
      'should create a base64-encoded source map from a string.'
    );

    t.notEqual(
      inlineSourceMapComment(Object.create(mapData)),
      '//' + mapBase64,
      'should ignore inherit properties.'
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
      /More than one argument required/,
      'should throw a type error when it doesn\'t take any arguments.'
    );

    t.equal(
      inlineSourceMapComment(mapData, {block: true}),
      '/* ' + mapBase64 + ' */',
      'should create a block comment when `block` option is enabled.'
    );

    t.equal(
      inlineSourceMapComment(mapDataWithSourcesContent),
      '//' + mapBase64,
      'should remove `sourcesContent` property.'
    );

    t.equal(
      inlineSourceMapComment(mapDataWithSourcesContent, {sourcesContent: true}),
      '//' + mapBase64WithSourcesContent,
      'should preserve `sourcesContent` property when `sourcesContent` option is enabled.'
    );

    t.equal(
      inlineSourceMapComment.prefix,
      '# sourceMappingURL=data:application/json;base64,',
      'should have `prefix` property.'
    );
  });
};
