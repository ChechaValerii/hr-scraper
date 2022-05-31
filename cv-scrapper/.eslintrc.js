module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  globals: {
    document: true,
  },
  rules: {
    'no-await-in-loop': 'off',
  },
};
