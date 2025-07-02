/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  bracketSpacing: true,
  useTabs: false,
  singleQuote: true,
  trailingComma: "none",
  semi: true,
  printWidth: 100,
};

export default config;
