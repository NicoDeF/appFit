import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

// Colors
const BG = '#07070f';
const ACCENT = '#e84c3d';
const TEXT = '#f2f2fa';

// App icon SVG — 1024x1024
// Minimal: dark bg, rounded square accent block, bold "F" + thin "IT"
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="${BG}"/>

  <!-- Accent circle glow -->
  <circle cx="512" cy="480" r="280" fill="${ACCENT}" opacity="0.08"/>

  <!-- Accent rounded square -->
  <rect x="312" y="272" width="400" height="400" rx="88" fill="${ACCENT}"/>

  <!-- Letter F -->
  <text
    x="512" y="548"
    font-family="'Arial Black', Arial, sans-serif"
    font-weight="900"
    font-size="280"
    fill="${TEXT}"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="-8"
  >F</text>

  <!-- "appfit" wordmark below -->
  <text
    x="512" y="762"
    font-family="Arial, sans-serif"
    font-weight="300"
    font-size="68"
    fill="${TEXT}"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="18"
    opacity="0.7"
  >APPFIT</text>
</svg>
`;

// Splash SVG — centered logo on dark bg, no wordmark
const splashSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="${BG}"/>
  <circle cx="512" cy="512" r="260" fill="${ACCENT}" opacity="0.08"/>
  <rect x="332" y="332" width="360" height="360" rx="80" fill="${ACCENT}"/>
  <text
    x="512" y="516"
    font-family="'Arial Black', Arial, sans-serif"
    font-weight="900"
    font-size="240"
    fill="${TEXT}"
    text-anchor="middle"
    dominant-baseline="middle"
  >F</text>
</svg>
`;

// Adaptive icon foreground — just the F block, no bg (bg is separate)
const foregroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect x="272" y="272" width="480" height="480" rx="100" fill="${ACCENT}"/>
  <text
    x="512" y="524"
    font-family="'Arial Black', Arial, sans-serif"
    font-weight="900"
    font-size="300"
    fill="${TEXT}"
    text-anchor="middle"
    dominant-baseline="middle"
  >F</text>
</svg>
`;

async function generate() {
  console.log('Generating icons...');

  // Main icon 1024x1024
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/images/icon.png');
  console.log('✓ icon.png');

  // Splash icon 1024x1024
  await sharp(Buffer.from(splashSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/images/splash-icon.png');
  console.log('✓ splash-icon.png');

  // Android adaptive foreground
  await sharp(Buffer.from(foregroundSvg))
    .resize(1024, 1024)
    .png()
    .toFile('assets/images/android-icon-foreground.png');
  console.log('✓ android-icon-foreground.png');

  // Android adaptive background (solid accent dark)
  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 7, g: 7, b: 15, alpha: 1 } }
  })
    .png()
    .toFile('assets/images/android-icon-background.png');
  console.log('✓ android-icon-background.png');

  // Favicon 32x32
  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile('assets/images/favicon.png');
  console.log('✓ favicon.png');

  console.log('\n🎉 All icons generated!');
}

generate().catch(console.error);
