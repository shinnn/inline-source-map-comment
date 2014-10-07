#!/usr/bin/env node
'use strict';

var fs = require('fs');

var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');

function help() {
  var chalk = require('chalk');

  console.log([
    chalk.cyan(pkg.name) + chalk.gray(' v' + pkg.version),
    pkg.description,
    '',
    'Usage1: ' + pkg.name + ' <source map string>',
    'Usage2: ' + pkg.name + ' --in <source map file>',
    'Usage3: cat <source map file> | ' + pkg.name,
    '',
    'Options:',
    chalk.yellow('--block, --css,    -b, -c') + '  Print a block comment instead of line comment',
    chalk.yellow('--sources-content, -s    ') + '  Preserve sourcesContent property',
    chalk.yellow('--in, --input,     -i    ') + '  Use a JSON file as a source',
    chalk.yellow('--help,            -h    ') + '  Print usage information',
    chalk.yellow('--version,         -v    ') + '  Print version',
    ''
  ].join('\n'));
}

function run(map) {
  if (!map) {
    help();
    return;
  }
  map = '' + map;

  var inlineSourceMapComment = require('./' + pkg.main);

  var options = {
    block: argv.css || argv.block || argv.c || argv.b,
    sourcesContent: argv['sources-content'] || argv.s
  };

  console.log(inlineSourceMapComment(map, options));
}

var inputFile = argv.in || argv.input || argv.i;

if (argv.version || argv.v) {
  console.log(pkg.version);
} else if (argv.help || argv.h) {
  help();
} else if (inputFile) {
  run(fs.readFileSync(inputFile).toString('utf8'));
} else if (process.stdin.isTTY) {
  run(argv._[0]);
} else {
  require('get-stdin')(run);
}
