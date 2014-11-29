#!/usr/bin/env node
'use strict';

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    css: 'block',
    b: 'block',
    c: 'block',
    s: 'sources-content',
    'in': 'input',
    i: 'input',
    h: 'help',
    v: 'version'
  },
  string: ['_', 'input'],
  boolean: ['block', 'sources-content', 'help', 'version']
});

function help() {
  var yellow = require('chalk').yellow;
  var pkg = require('./package.json');
  var sumUp = require('sum-up');

  console.log([
    sumUp(pkg),
    '',
    'Usage1: ' + pkg.name + ' <source map string>',
    'Usage2: ' + pkg.name + ' --in <source map file>',
    'Usage3: cat <source map file> | ' + pkg.name,
    '',
    'Options:',
    yellow('--block, --css,    -b, -c') + '  Print a block comment instead of line comment',
    yellow('--sources-content, -s    ') + '  Preserve sourcesContent property',
    yellow('--in, --input,     -i    ') + '  Use a JSON file as a source',
    yellow('--help,            -h    ') + '  Print usage information',
    yellow('--version,         -v    ') + '  Print version',
    ''
  ].join('\n'));
}

function run(map) {
  if (!map) {
    help();
    return;
  }

  var inlineSourceMapComment = require('./');

  var options = {
    block: argv.block,
    sourcesContent: argv['sources-content']
  };

  console.log(inlineSourceMapComment(map, options));
}

var inputFile = argv.input;

if (argv.version) {
  console.log(require('./package.json').version);
} else if (argv.help) {
  help();
} else if (inputFile) {
  var fs = require('fs');
  run(fs.readFileSync(inputFile, 'utf8'));
} else if (process.stdin.isTTY) {
  run(argv._[0]);
} else {
  require('get-stdin')(run);
}
