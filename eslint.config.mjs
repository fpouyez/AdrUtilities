import tseslint from "typescript-eslint";

export default tseslint.configs.recommended.map(config => ({
  ...config,
  files: ["src/**/*.{ts,tsx,cts,mts}"],
}));
