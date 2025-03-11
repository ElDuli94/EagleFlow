import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // Last inn miljøvariabler basert på gjeldende modus
    var env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        base: './',
        build: {
            outDir: 'dist',
            assetsDir: 'assets',
            emptyOutDir: true
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        define: {
            // Gjør miljøvariabler tilgjengelige globalt
            'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
            'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
            'import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY': JSON.stringify(env.VITE_SUPABASE_SERVICE_ROLE_KEY || '')
        }
    };
});
