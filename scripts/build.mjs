// The site is plain static files in public/. "Building" is copying them to
// dist/, which is what the deploy workflow publishes to Cloudflare Pages.
import { cpSync, rmSync } from 'node:fs';

rmSync('dist', { recursive: true, force: true });
cpSync('public', 'dist', { recursive: true });
console.log('public/ -> dist/');
