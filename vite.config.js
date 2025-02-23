import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";

export default defineConfig(({ mode }) => {
  return {
    server: {
      host: true, // Allows access from LAN
      https:
        mode === "development"
          ? {
              key: fs.readFileSync("./cert.key"), // Local SSL for dev
              cert: fs.readFileSync("./cert.crt"),
            }
          : false, // Disable HTTPS in production (Vercel handles it)
    },
    plugins: [react(), tailwindcss()],
  };
});
