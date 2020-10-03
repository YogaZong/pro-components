module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  ignorePatterns: ['webpack.config.js'],
  rules: {
    'import/no-extraneous-dependencies': 0,
    'import/no-unresolved': 0,
  },
};
