import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [basicSsl()],
});
