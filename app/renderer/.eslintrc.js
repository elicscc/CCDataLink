module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module',
    parser: '@typescript-eslint/parser' // 解析 .ts 文件
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: ['standard', 'plugin:@typescript-eslint/recommended'],
  globals: {
    __static: true
  },
  // required to lint *.vue files
  plugins: [
    'vue',
    'html',
    '@typescript-eslint'
  ],
  rules: {
    'no-inner-declarations': 0,
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 1 : 0,
    '@typescript-eslint/no-this-alias': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-unused-vars': 0
  }
}
