import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(() => {
  return {
    server: {
      host: true, // Allows access from LAN
      https: false, // ✅ Disable HTTPS locally (fix)
    },
    plugins: [react(), tailwindcss()],
  };
});
