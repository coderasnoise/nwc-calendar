/* eslint-disable @typescript-eslint/no-require-imports */
const { FlatCompat } = require("@eslint/eslintrc");

const compat = new FlatCompat({
  baseDirectory: __dirname
});

module.exports = [
  {
    ignores: [".next/**", "node_modules/**", "coverage/**", "dist/**", "build/**", "next-env.d.ts"]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier")
];
