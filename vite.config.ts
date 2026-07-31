import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      entryRoot: "src",
      tsconfigPath: "./tsconfig.app.json",
      insertTypesEntry: true,
      include: ["src"],
      exclude: ["src/app.tsx", "src/main.tsx"],
    }),
  ],
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
  build: {
    lib: {
      entry: "src/index.ts",
      name: "ExpUi",
      fileName: "exp-ui",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
});
