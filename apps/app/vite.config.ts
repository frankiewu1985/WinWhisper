import { sveltekit } from '@sveltejs/kit/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit(),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/recording.html',
                    dest: ''
                }
            ]
        })
	],
});
