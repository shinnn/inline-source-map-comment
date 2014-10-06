/*!
 * inline-source-map-comment | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/inline-source-map-comment
*/
'use strict';

(function() {
  function sourceMapBody(map) {
    if (typeof map === 'string') {
      map = JSON.parse(map);
    }

    delete map.sourcesContent;

    return '# sourceMappingURL=data:application/json;base64,' +
           btoa(JSON.stringify(map));
  }

  function inlineSourceMapCommentJs(map) {
    return '//' + sourceMapBody(map);
  }

  function inlineSourceMapCommentCss(map) {
    return '/* ' + sourceMapBody(map) + ' */';
  }

  window.inlineSourceMapComment = inlineSourceMapCommentJs;
  window.inlineSourceMapComment.js = inlineSourceMapCommentJs;
  window.inlineSourceMapComment.css = inlineSourceMapCommentCss;
})();
