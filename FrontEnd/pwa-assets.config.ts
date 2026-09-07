import {
    defineConfig,
} from '@vite-pwa/assets-generator/config'

export default defineConfig({
    headLinkOptions: {
        preset: '2023',
    },
    preset: {
        transparent: {
            sizes: [64, 192, 512],
            favicons: [[48, 'favicon.ico']],
            resizeOptions: {
                background: '#1594C7',
                fit: 'contain',
            },
        },
        maskable: {
            sizes: [512],
            resizeOptions: {
                background: '#1594C7',
                fit: 'contain',
            },
        },
        apple: {
            sizes: [180],
            resizeOptions: {
                background: '#1594C7',
                fit: 'contain',
            },
        },
    },
    images: ['public/favicon.svg'],
})