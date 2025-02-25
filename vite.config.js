import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { heroui } from "@heroui/react";

export default defineConfig(() => {
  return {
    server: {
      host: true, // Allows access from LAN
      https: false, // ✅ Disable HTTPS locally (fix)
    },
    darkmode: "class",
    plugins: [react(), tailwindcss(), heroui()],
  };
});
