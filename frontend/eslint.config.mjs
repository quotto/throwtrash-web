import nextConfig from "eslint-config-next";
import jestDom from "eslint-plugin-jest-dom";
import testingLibrary from "eslint-plugin-testing-library";

export default [
  {
    ignores: [
      "babel.config.js",
      "webpack.config.js",
      "jest.config.mjs",
      "eslint.config.mjs",
      "react/**",
      "md/**",
      "static/**"
    ]
  },
  ...nextConfig,
  {
    plugins: {
      "jest-dom": jestDom,
      "testing-library": testingLibrary
    },
    languageOptions: {
      globals: {
        React: true
      }
    },
    settings: {
      react: {
        version: "detect"
      }
    },
    rules: {
      "jest-dom/prefer-enabled-disabled": "warn",
      "testing-library/no-node-access": "off"
    }
  }
];
