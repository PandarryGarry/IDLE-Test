import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rawPort = process.env.PORT || '3000';
const port = Number(rawPort);

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'arena-preview-no-hmr-client',
      transformIndexHtml(html) {
        // Убираем /@vite/client — в iframe превью его WebSocket роняет страницу.
        return html
          .replace(/<script type="module">import \{ injectIntoGlobalHook \}[\s\S]*?<\/script>/, '')
          .replace(/<script type="module" src="\/@vite\/client"><\/script>/, '');
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-auth';
          }
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
    // Превью Arena идёт через HTTPS-прокси. Клиент Vite иначе стучится
    // на ws://localhost:3000 из браузера пользователя — белый экран и reset.
    hmr: false,
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
    cors: true,
    headers: {
      'Content-Security-Policy': "frame-ancestors *",
    },
  },
});
