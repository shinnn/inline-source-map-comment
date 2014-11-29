'use strict';

var spawn = require('child_process').spawn;

var mapPrefix = require('../../').prefix;
var test = require('tape');

var mapJson = '{"version":3,"file":"bars.js.map","sources":["foo.js"],"names":[],"mappings":"AAAA"}';
var mapBase64 = mapPrefix + new Buffer(mapJson).toString('base64');
var expectedLine = '//' + mapBase64 + '\n';
var expectedBlock = '/* ' + mapBase64 + ' */' + '\n';

var mapJsonWithSourcesContent = '{"version":3,"file":"bars.js.map","sources":["foo.js"],"names":[],"mappings":"AAAA","sourcesContent":["0"]}';
var mapBase64WithSourcesContent = mapPrefix + new Buffer(mapJsonWithSourcesContent).toString('base64');

var expectedLineWithSourcesContent = '//' + mapBase64WithSourcesContent + '\n';

var pkg = require('../../package.json');
var TMP_FILE_PATH = 'test/test-cli/fixture.js.map';

test('"inline-source-map-comment" command', function(t) {
  t.plan(19);

  var cmd = function(args) {
    return spawn('node', [pkg.bin].concat(args), {
      stdio: [process.stdin, null, null]
    });
  };

  cmd([mapJson])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLine,
        'should print base64-encoded source map comment from a string.'
      );
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
    .stderr.on('data', function(data) {
      syntaxErr += data.toString();
    });

  cmd([mapJson, '--css'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should print block comment with `--css` flag.');
    });

  cmd([mapJson, '--block'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--block` alias.');
    });

  cmd([mapJson, '--c'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--c` alias.');
    });

  cmd([mapJson, '--b'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedBlock, 'should accept `--b` alias.');
    });

  cmd([mapJsonWithSourcesContent])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedLine, 'should remove `sourcesContent` property.');
    });

  cmd([mapJsonWithSourcesContent, '--sources-content'])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLineWithSourcesContent,
        'should preserve `sourcesContent` property with --sources-content flag.'
      );
    });

  cmd([mapJsonWithSourcesContent, '-s'])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLineWithSourcesContent,
        'should accept -s alias.'
      );
    });

  cmd(['--in', TMP_FILE_PATH])
    .stdout.on('data', function(data) {
      t.equal(
        data.toString(), expectedLine,
        'should use a JSON file as a source with --in flag.'
      );
    });

  var readErr = '';

  cmd(['--in', 'foo'])
    .on('close', function(code) {
      t.notEqual(code, 0, 'should fail when the file doesn\'t exist.');
      t.ok(
        /ENOENT/.test(readErr),
        'should print an error when the file doesn\'t exist.'
      );
    })
    .stderr.on('data', function(data) {
      readErr += data.toString();
    });

  cmd(['--input', TMP_FILE_PATH])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), expectedLine, 'should accept --input alias.');
    });

  cmd(['-i', TMP_FILE_PATH])
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
      t.equal(data.toString(), pkg.version + '\n', 'should print version number with --version flag.');
    });

  cmd(['-v'])
    .stdout.on('data', function(data) {
      t.equal(data.toString(), pkg.version + '\n', 'should accept -v alias.');
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
