import { viteStaticCopy } from 'vite-plugin-static-copy';

/** @type {import('vite').UserConfig} */
export default {
    plugins: [
        viteStaticCopy({
            targets: [
                {
                    src: 'resources',
                    dest: '../build'
                },
                {
                    src: 'localserver.js',
                    dest: '../build'
                }
            ]
        })
    ],
    root: 'public',
    mode: 'production',
    build: {
        outDir: '../build',
        emptyOutDir: true,        
    },
    server: {
        hmr: false,
    },
}