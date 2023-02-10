import { defineConfig, Plugin } from "vite";

import react from "@vitejs/plugin-react";
import plugins from "vite-web-sdk/plugins";

export default defineConfig({
    plugins: [
        // Remove to get page reloads always
        react(),

        plugins(),
    ],
})
