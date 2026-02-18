
import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

function copyDir(src, dest) {
    if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
    const entries = readdirSync(src);
    for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        if (statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            // Don't overwrite existing files (HTML/CSS processed by Vite)
            // Unless it's JS, which Vite ignored.
            if (!existsSync(destPath) || entry.endsWith('.js')) {
                copyFileSync(srcPath, destPath);
            }
        }
    }
}

const assignments = [
    { src: 'examples/dogfood/weapon-skins/app.js', dest: 'dist/examples/dogfood/weapon-skins/app.js' },
    { src: 'examples/dogfood/scroll-site/app.js', dest: 'dist/examples/dogfood/scroll-site/app.js' },
    { src: 'examples/dogfood/samsung-tv/js', dest: 'dist/examples/dogfood/samsung-tv/js' } // Dir copy
];

console.log('Copying Dogfood assets...');

assignments.forEach(({ src, dest }) => {
    if (statSync(src).isDirectory()) {
        copyDir(src, dest);
    } else {
        const dir = dirname(dest);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        copyFileSync(src, dest);
    }
    console.log(`Copied ${src} -> ${dest}`);
});

console.log('Dogfood assets copy complete.');
