import nextPlugin from "@next/eslint-plugin-next";

export default [
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.flatConfigs.recommended.rules,
      ...nextPlugin.flatConfigs["core-web-vitals"].rules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "off",
    },
  },
];
