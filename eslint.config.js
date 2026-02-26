// eslint.config.js for ESLint v9+
const globals = {
  window: true,
  document: true,
  navigator: true,
  fetch: true,
  FormData: true,
  Request: true,
  Response: true,
  Headers: true,
  console: true,
  crypto: true,
  addEventListener: true,
};

module.exports = [
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["node_modules/**", "dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals,
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^unused" }],
      "no-undef": "warn",
      "no-restricted-imports": ["error", {
        "paths": [
          { "name": "http", "message": "禁止使用 Node 原生命令 http" },
          { "name": "net", "message": "禁止使用 Node 原生命令 net" },
          { "name": "tls", "message": "禁止使用 Node 原生命令 tls" },
          { "name": "dgram", "message": "禁止使用 Node 原生命令 dgram" },
          { "name": "child_process", "message": "禁止使用 Node 原生命令 child_process" },
          { "name": "fs", "message": "禁止使用 Node 原生命令 fs" },
          { "name": "fs/promises", "message": "禁止使用 Node 原生命令 fs/promises" },
          { "name": "os", "message": "禁止使用 Node 原生命令 os" }
        ]
      }],
    },
  },
];
