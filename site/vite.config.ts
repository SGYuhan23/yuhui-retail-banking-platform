import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "/yuhui-retail-banking-platform/",
  build: { sourcemap: false },
});
