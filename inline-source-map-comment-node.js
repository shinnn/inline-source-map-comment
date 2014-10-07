/*!
 * inline-source-map-comment | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/inline-source-map-comment
*/
'use strict';

function shallowCopy(obj) {
  var result = {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

module.exports = function inlineSourceMapComment(_map, options) {
  options = options || {};
  var map;

  if (typeof _map === 'string') {
    map = JSON.parse(_map);
  } else {
    if (arguments.length === 0) {
      throw new Error('More than one argument required.');
    }
    map = shallowCopy(_map);
  }

  if (!options.sourcesContent) {
    delete map.sourcesContent;
  }

  var sourceMapBody = module.exports.prefix + new Buffer(JSON.stringify(map)).toString('base64');

  if (options.block) {
    return '/* ' + sourceMapBody + ' */';
  }
  return '//' + sourceMapBody;
};

module.exports.prefix = '# sourceMappingURL=data:application/json;base64,';
