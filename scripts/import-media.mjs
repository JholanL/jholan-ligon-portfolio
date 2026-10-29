// Copies the curated media out of Portfolio-Assets/ (never modified) into the site,
// and derives posters, preview loops and film stills from the real footage.
//
//   npm run media            copy + derive (skips files that already exist)
//   npm run media -- --force overwrite everything
//
// Images go to src/assets/ so Astro can build responsive, optimised variants.
// Videos go to public/media/ and are served as-is (already H.264/AAC, faststart).
// Derivations need ffmpeg: set FFMPEG=path, or it falls back to .tooling/ffmpeg-static.

import { existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1')), '..');
const src = join(root, 'Portfolio-Assets');
const force = process.argv.includes('--force');

const ffmpeg = [
  process.env.FFMPEG,
  join(root, '.tooling/node_modules/ffmpeg-static/ffmpeg.exe'),
  join(root, '.tooling/node_modules/ffmpeg-static/ffmpeg'),
].find((p) => p && existsSync(p));

function copy(from, to) {
  const a = join(src, from);
  const b = join(root, to);
  if (!existsSync(a)) return console.warn(`  missing source: ${from}`);
  if (existsSync(b) && !force) return;
  mkdirSync(dirname(b), { recursive: true });
  copyFileSync(a, b);
  console.log(`  copy  ${to}`);
}

function copyDir(from, to, filter = () => true) {
  const dir = join(src, from);
  if (!existsSync(dir)) return console.warn(`  missing folder: ${from}`);
  for (const f of readdirSync(dir).filter(filter)) copy(join(from, f), join(to, f));
}

function derive(to, args) {
  const out = join(root, to);
  if (existsSync(out) && !force) return;
  if (!ffmpeg) return console.warn(`  skip  ${to} (ffmpeg not found)`);
  mkdirSync(dirname(out), { recursive: true });
  execFileSync(ffmpeg, ['-v', 'error', '-y', ...args, out]);
  console.log(`  make  ${to}`);
}

const still = (video, t, to, w = 1920) => derive(to, ['-ss', String(t), '-i', join(src, video), '-frames:v', '1', '-vf', `scale=${w}:-2`, '-q:v', '2']);
// Short muted loop for hover previews: 960px, no audio, small.
const loop = (video, t, d, to) => derive(to, ['-ss', String(t), '-t', String(d), '-i', join(src, video), '-an', '-vf', 'scale=960:-2,fps=30', '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-pix_fmt', 'yuv420p', '-movflags', '+faststart']);

const png = (f) => f.endsWith('.png');

console.log('TopCraft');
copy('TOPCRAFT/topcraft-advertisement-landscape.png', 'src/assets/projects/topcraft/ad.png');
copyDir('TOPCRAFT/marketing-campaign/web/png', 'src/assets/projects/topcraft/web', png);
copyDir('TOPCRAFT/marketing-campaign/mobile/png', 'src/assets/projects/topcraft/mobile', png);
copy('TOPCRAFT/marketing-campaign/responsive/png/topcraft-responsive-showcase.png', 'src/assets/projects/topcraft/responsive.png');
copyDir('TOPCRAFT/marketing-campaign/original-captures/web', 'src/assets/projects/topcraft/captures/web', png);
copyDir('TOPCRAFT/marketing-campaign/original-captures/mobile', 'src/assets/projects/topcraft/captures/mobile', png);

console.log('VoiceLink Academy');
const vl = 'VOICELINK/video/voicelink-walkthrough.mp4';
copy('VOICELINK/voicelink-cover.png', 'src/assets/projects/voicelink/cover.png');
copyDir('VOICELINK/showcase', 'src/assets/projects/voicelink/showcase', png);
copy('VOICELINK/video/voicelink-walkthrough-poster.png', 'src/assets/projects/voicelink/poster.png');
copy(vl, 'public/media/voicelink/film.mp4');
loop(vl, 44, 6, 'public/media/voicelink/preview.mp4');

console.log('FemiSafe');
const fs = 'FEMISAFE/FemiSafe-WithinReach-16x9.mp4';
copyDir('FEMISAFE/app-store-screenshots/png', 'src/assets/projects/femisafe/store', png);
copyDir('FEMISAFE/app-store-screenshots/source-screens', 'src/assets/projects/femisafe/screens', png);
copy(fs, 'public/media/femisafe/film.mp4');
still(fs, 9.5, 'src/assets/projects/femisafe/poster.jpg');
loop(fs, 44, 6, 'public/media/femisafe/preview.mp4');

console.log('FoodWais');
const fw = 'FOODWISE/foodwais-film-final.mp4';
copy('FOODWISE/FoodWais_ Smart Pantry Showcase.png', 'src/assets/projects/foodwais/showcase.png');
copy(fw, 'public/media/foodwais/film.mp4');
still(fw, 8.6, 'src/assets/projects/foodwais/poster.jpg');
loop(fw, 9, 6, 'public/media/foodwais/preview.mp4');
// Film stills: real frames, used as a storyboard that seeks the film.
for (const [t, name] of [
  [4.5, '01-problem'], [10.6, '02-scan'], [14.6, '03-fresh'], [23.2, '04-recipe'],
  [27.2, '05-prices'], [36.4, '06-haggle'], [45.6, '07-compare'], [54.6, '08-local-ai'],
]) still(fw, t, `src/assets/projects/foodwais/stills/${name}.jpg`);

console.log('Profile');
copy('../2x2 (1).jpg', 'src/assets/profile/jholan.jpg');

console.log('Done.');
