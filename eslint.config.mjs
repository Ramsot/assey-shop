import nextPlugin from "@next/eslint-plugin-next";

const nextRules = {
  ...nextPlugin.flatConfig.recommended.rules,
  ...nextPlugin.flatConfig.coreWebVitals.rules,
};

export default [
  {
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextRules,
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "react/no-unescaped-entities": "off",
    },
  },
];
