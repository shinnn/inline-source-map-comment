/*!
 * inline-source-map-comment | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/inline-source-map-comment
*/
'use strict';

function sourceMapBody(map) {
  if (typeof map === 'string') {
    map = JSON.parse(map);
  }

  delete map.sourcesContent;

  return '# sourceMappingURL=data:application/json;base64,' +
         btoa(JSON.stringify(map));
}

module.exports = function inlineSourceMapCommentJs(map) {
  return '//' + sourceMapBody(map);
};

module.exports.js = module.exports;

module.exports.css = function inlineSourceMapCommentCss(map) {
  return '/* ' + sourceMapBody(map) + ' */';
};
