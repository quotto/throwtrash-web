import path from 'path';

type CloudFrontRequest = {
  uri: string;
};

type CloudFrontEvent = {
  request: CloudFrontRequest;
};

type Handler = (event: CloudFrontEvent) => CloudFrontRequest;

const loadHandler = (): Handler => {
  const functionPath = path.join(__dirname, '..', 'lib', 'cloudfront', 'path-rewrite-function.js');
  // eslint-disable-next-line @typescript-eslint/no-var-requires -- CommonJSの関数読み込みが必要
  const moduleExports = require(functionPath) as { handler?: Handler };

  if (!moduleExports.handler) {
    throw new Error('handler が見つかりません');
  }

  return moduleExports.handler;
};

describe('path-rewrite-function', () => {
  const handler = loadHandler();

  test('backend のパスを先頭で削除する', () => {
    const result = handler({ request: { uri: '/backend/api' } });
    expect(result.uri).toBe('/api');
  });

  test('backend ルートは / に正規化する', () => {
    const result = handler({ request: { uri: '/backend' } });
    expect(result.uri).toBe('/');
  });

  test('backend 末尾スラッシュは / を維持する', () => {
    const result = handler({ request: { uri: '/backend/' } });
    expect(result.uri).toBe('/');
  });

  test('mobile ルートは / に正規化する', () => {
    const result = handler({ request: { uri: '/mobile' } });
    expect(result.uri).toBe('/');
  });

  test('mobile のパスを先頭で削除する', () => {
    const result = handler({ request: { uri: '/mobile/api' } });
    expect(result.uri).toBe('/api');
  });

  test('alarm ルートは / に正規化する', () => {
    const result = handler({ request: { uri: '/alarm' } });
    expect(result.uri).toBe('/');
  });

  test('alarm のパスを先頭で削除する', () => {
    const result = handler({ request: { uri: '/alarm/notify' } });
    expect(result.uri).toBe('/notify');
  });

  test('末尾スラッシュは index.html を付与する', () => {
    const result = handler({ request: { uri: '/docs/' } });
    expect(result.uri).toBe('/docs/index.html');
  });

  test('それ以外は index.html 置換を試みても変更されない', () => {
    const result = handler({ request: { uri: '/about?query=1' } });
    expect(result.uri).toBe('/about?query=1');
  });
});
