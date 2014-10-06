'use strict';

var EOL = require('os').EOL;
var spawn = require('child_process').spawn;

var pkg = require('load-pkg');
var test = require('tape');
var xtend = require('xtend');

var fixture = require('../fixture.js');
var fixtureJson = JSON.stringify(fixture.json);
var expectedLine = '//' + fixture.base64 + EOL;
var expectedBlock = '/* ' + fixture.base64 + ' */' + EOL;

test('"inline-source-map-comment" command', function(t) {
  t.plan(17);

  var cmd = function(args) {
    return spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
  };

  cmd([fixtureJson])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLine,
        'should print base64-encoded source map comment from a string.'
      );
    });

  var syntaxErr = '';

  cmd(['{'])
    .on('close', function(code) {
      t.equal(code, 8, 'should fail when the string in not a valid JSON.');
      t.ok(
        /SyntaxError/.test(syntaxErr),
        'should print a syntax error when the string in not a valid JSON.'
      );
    })
    .stderr.on('data', function(data) {
      syntaxErr += data.toString();
    });

  cmd([fixtureJson, '--css'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should print block comment with `--css` flag.');
    });

  cmd([fixtureJson, '--block'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--block` alias.');
    });

  cmd([fixtureJson, '--c'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--c` alias.');
    });

  cmd([fixtureJson, '--b'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--b` alias.');
    });

  cmd([JSON.stringify(xtend(fixture.json, {sourcesContent: 'foo'}))])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedLine, 'should remove `sourcesContent` property.');
    });

  cmd(['--in', 'test/test-cli/fixture-cli.json'])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLine,
        'should use a JSON file as a source with --in flag.'
      );
    });

  var readErr = '';

  cmd(['--in', 'foo'])
    .on('close', function(code) {
      t.equal(code, 8, 'should fail when the file doesn\'t exist.');
      t.ok(
        /ENOENT/.test(readErr),
        'should print an error when the file doesn\'t exist.'
      );
    })
    .stderr.on('data', function(data) {
      readErr += data.toString();
    });

  cmd(['--input', 'test/test-cli/fixture-cli.json'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedLine, 'should accept --input alias.');
    });

  cmd(['-i', 'test/test-cli/fixture-cli.json'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedLine, 'should accept -i alias.');
    });

  cmd(['--help'])
    .stdout.on('data', function(data) {
      t.ok(
        /Usage/.test(data.toString()),
        'should print usage information with --help flag.'
      );
    });

  cmd(['--h'])
    .stdout.on('data', function(data) {
      t.ok(/Usage/.test(data.toString()), 'should accept -h alias.');
    });

  cmd(['--version'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), pkg.version + EOL, 'should print version number with --version flag.');
    });

  cmd(['-v'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), pkg.version + EOL, 'should accept -v alias.');
    });
});

test('"inline-source-map-comment" command with pipe (`|`)', function(t) {
  t.plan(2);

  var cmd = function(args) {
    return spawn('node', [pkg.bin].concat(args), {
      stdio: ['pipe', null, null]
    });
  };

  var cp = cmd([]);
  cp.stdout.on('data', function(data) {
    t.equal(
      data.toString(), expectedLine,
      'should print base64-encoded source map comment from STDIN.'
    );
  });
  cp.stdin.write(fixtureJson);
  cp.stdin.end();

  var cpEmpty = cmd([]);
  cpEmpty.stdout.on('data', function(data) {
    t.ok(
      /Usage/.test(data.toString()),
      'should print usage information when STDIN is empty.'
    );
  });
  cpEmpty.stdin.write('');
  cpEmpty.stdin.end();
});
