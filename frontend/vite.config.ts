import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  preview: {
    allowedHosts: [
      "nomioc.com",
      "www.nomioc.com",
      "complianceai-platform-1.onrender.com"
    ]
  }
});
