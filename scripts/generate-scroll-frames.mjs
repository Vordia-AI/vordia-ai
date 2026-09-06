import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

// Run only when the source video changes. Generated WebP assets are committed
// so Pages builds and phones do not need a video decoder to create the frames.
const root = fileURLToPath(new URL('../', import.meta.url));
const input = path.join(root, 'public/assets/vordia-duo-scroll.mp4');
const output = path.join(root, 'public/assets/duo-scroll-v1');
const frameCount = 90;
const width = 960;
const metadata = JSON.parse(
  execFileSync(
    'ffprobe',
    [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=nb_frames,width,height',
      '-of',
      'json',
      input,
    ],
    { encoding: 'utf8' },
  ),
);
const stream = metadata.streams[0];
const sourceFrameCount = Number(stream.nb_frames);
if (!Number.isFinite(sourceFrameCount) || sourceFrameCount < frameCount) {
  throw new Error('The source video must report at least 90 frames.');
}

// Include the exact first and last frames, with evenly spaced frames between.
const selected = Array.from(
  { length: frameCount },
  (_, index) =>
    `eq(n,${Math.round((index * (sourceFrameCount - 1)) / (frameCount - 1))})`,
).join('+');
mkdirSync(output, { recursive: true });
const height = Math.round((width * stream.height) / stream.width);
const frameBytes = width * height * 3;
const pixels = execFileSync(
  'ffmpeg',
  [
    '-hide_banner',
    '-loglevel',
    'error',
    '-i',
    input,
    '-vf',
    `select='${selected}',scale=${width}:-2`,
    '-fps_mode',
    'vfr',
    '-frames:v',
    String(frameCount),
    '-f',
    'rawvideo',
    '-pix_fmt',
    'rgb24',
    'pipe:1',
  ],
  { maxBuffer: frameCount * frameBytes + 1_000_000 },
);
if (pixels.length !== frameCount * frameBytes) {
  throw new Error('The decoded frame count does not match the manifest.');
}
for (let index = 0; index < frameCount; index += 1) {
  await sharp(pixels.subarray(index * frameBytes, (index + 1) * frameBytes), {
    raw: { width, height, channels: 3 },
  })
    .webp({ quality: 78, effort: 6 })
    .toFile(path.join(output, `frame-${String(index).padStart(3, '0')}.webp`));
}
writeFileSync(
  path.join(output, 'manifest.json'),
  JSON.stringify(
    {
      frameCount,
      width,
      height,
      basePath: '/assets/duo-scroll-v1',
    },
    null,
    2,
  ) + '\n',
);
console.log(`Generated ${frameCount} scroll frames in ${output}`);
