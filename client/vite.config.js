import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

console.log(new URL(import.meta.url).pathname);
console.log(new URL(".src/", import.meta.url).pathname);
// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
  plugins: [react()],
});
