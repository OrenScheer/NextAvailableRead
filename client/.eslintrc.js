module.exports = {
  plugins: ["@typescript-eslint", "eslint-comments"],
  extends: [
    "airbnb-typescript",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:eslint-comments/recommended",
    "prettier",
  ],
  env: {
    node: true,
    browser: true,
  },
  parserOptions: {
    project: "./tsconfig.json",
  },
};
