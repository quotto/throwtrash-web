function handler(event) {
  var request = event.request;
  if (request.uri === '/backend' || request.uri.indexOf('/backend/') === 0) {
    request.uri = request.uri.substring('/backend'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri === '/mobile' || request.uri.indexOf('/mobile/') === 0) {
    request.uri = request.uri.substring('/mobile'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri === '/alarm' || request.uri.indexOf('/alarm/') === 0) {
    request.uri = request.uri.substring('/alarm'.length);
    if (request.uri === '') {
      request.uri = '/';
    }
  } else if (request.uri.endsWith('/')) {
    request.uri += 'index.html';
  } else {
    request.uri.replace('/?','/index.html?');
  }
  return request;
}

/* istanbul ignore next */
// テスト環境でのエクスポート判定
if (typeof module !== 'undefined') {
  module.exports = { handler };
}
