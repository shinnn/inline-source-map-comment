'use strict';

var spawn = require('child_process').spawn;

var mapPrefix = require('..').prefix;
var test = require('tape');

var mapJson = '{"version":3,"file":"bars.js.map","sources":["foo.js"],"names":[],"mappings":"AAAA"}';
var mapBase64 = mapPrefix + new Buffer(mapJson).toString('base64');
var expectedLine = '//' + mapBase64 + '\n';
var expectedBlock = '/* ' + mapBase64 + ' */' + '\n';

var mapJsonWithSourcesContent = '{"version":3,"file":"bars.js.map","sources":["foo.js"],"names":[],"mappings":"AAAA","sourcesContent":["0"]}';
var mapBase64WithSourcesContent = mapPrefix + new Buffer(mapJsonWithSourcesContent).toString('base64');

var expectedLineWithSourcesContent = '//' + mapBase64WithSourcesContent + '\n';

var pkg = require('../package.json');
var TMP_FILE_PATH = 'test-cli/fixture.js.map';

test('"inline-source-map-comment" inside TTY context', function(t) {
  t.plan(19);

  var cmd = function(args) {
    var cp = spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
    cp.stdout.setEncoding('utf8');
    cp.stderr.setEncoding('utf8');
    return cp;
  };

  cmd([mapJson]).stdout.on('data', function(output) {
    t.equal(output, expectedLine, 'should print base64-encoded source map comment from a string.');
  });

  var syntaxErr = '';

  cmd(['{'])
    .on('close', function(code) {
      t.notEqual(code, 0, 'should fail when the string in not a valid JSON.');
      t.ok(
        /SyntaxError/.test(syntaxErr),
        'should print a syntax error when the string in not a valid JSON.'
      );
    })
    .stderr.on('data', function(output) {
      syntaxErr += output;
    });

  cmd([mapJson, '--css']).stdout.on('data', function(output) {
    t.equal(output, expectedBlock, 'should print block comment with `--css` flag.');
  });

  cmd([mapJson, '--block']).stdout.on('data', function(output) {
    t.equal(output, expectedBlock, 'should use `--block` as an alias of `--css`.');
  });

  cmd([mapJson, '-c']).stdout.on('data', function(output) {
    t.equal(output, expectedBlock, 'should use `-c` as an alias of `--css`.');
  });

  cmd([mapJson, '-b']).stdout.on('data', function(output) {
    t.equal(output, expectedBlock, 'should use `-b` as an alias of `--css`.');
  });

  cmd([mapJsonWithSourcesContent]).stdout.on('data', function(output) {
    t.equal(output, expectedLine, 'should remove `sourcesContent` property.');
  });

  cmd([mapJsonWithSourcesContent, '--sources-content']).stdout.on('data', function(output) {
    t.equal(
      output,
      expectedLineWithSourcesContent,
      'should preserve `sourcesContent` property with --sources-content flag.'
    );
  });

  cmd([mapJsonWithSourcesContent, '-s']).stdout.on('data', function(output) {
    t.equal(
      output,
      expectedLineWithSourcesContent,
      'should use `-s` as an alias of `--sources-content`.'
    );
  });

  cmd(['--in', TMP_FILE_PATH]).stdout.on('data', function(output) {
    t.equal(output, expectedLine, 'should use a JSON file as a source with --in flag.');
  });

  var readErr = '';

  cmd(['--in', '__this__file__does__not__exist__'])
    .on('close', function(code) {
      t.notEqual(code, 0, 'should fail when the file doesn\'t exist.');
      t.ok(
        /ENOENT/.test(readErr),
        'should print an error when the file doesn\'t exist.'
      );
    })
    .stderr.on('data', function(output) {
      readErr += output;
    });

  cmd(['--input', TMP_FILE_PATH]).stdout.on('data', function(output) {
    t.equal(output, expectedLine, 'should use `--input` as an alias of `--in`.');
  });

  cmd(['-i', TMP_FILE_PATH]).stdout.on('data', function(output) {
    t.equal(output, expectedLine, 'should use `-i` as an alias of `--in`.');
  });

  cmd(['--help']).stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should print usage information with --help flag.');
  });

  cmd(['-h']).stdout.on('data', function(output) {
    t.ok(/Usage/.test(output), 'should use `-h` as an alias of `--help`.');
  });

  cmd(['--version']).stdout.on('data', function(output) {
    t.equal(output, pkg.version + '\n', 'should print version number with --version flag.');
  });

  cmd(['-v']).stdout.on('data', function(output) {
    t.equal(output, pkg.version + '\n', 'should use `-v` as an alias of `--version`.');
  });
});

test('"inline-source-map-comment" command outside TTY context', function(t) {
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
  cp.stdin.end(mapJson);

  var cpEmpty = cmd([]);
  cpEmpty.stdout.on('data', function(data) {
    t.ok(
      /Usage/.test(data.toString()),
      'should print usage information when STDIN is empty.'
    );
  });
  cpEmpty.stdin.end('');
});
