const i18nConfig = {
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    localeDetection: true,
    // デフォルトロケールにプレフィックスを付けない（/ja を要求しない）設定
    prefixDefault: false,
    // すべてのロケールでパスにプレフィックスを付けない
    noPrefix: true
};

export default i18nConfig;
