import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';

function htmlTransformPlugin(): Plugin {
  return {
    name: 'html-transform-plugin',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        let result = html.replace(/<link rel="stylesheet" crossorigin href="\.\/assets\/.*?">/g, '');
        result = result.replace(
          /<script type="module" crossorigin src="\.\/assets\/.*?"><\/script>/g,
          '<script type="module" src="/src/main.tsx"></script>'
        );
        return result;
      },
    },
  };
}

export default defineConfig(() => {
  return {
    base: './',
    plugins: [htmlTransformPlugin(), react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
