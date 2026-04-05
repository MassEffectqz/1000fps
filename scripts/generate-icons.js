/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require('sharp');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Orange gradient background with "1000" text
async function generateIcon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#ff8800"/>
          <stop offset="100%" style="stop-color:#ff4400"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size*0.15}" fill="url(#bg)"/>
      <text x="50%" y="42%" font-family="Arial, sans-serif" font-weight="900" font-size="${size*0.22}" fill="white" text-anchor="middle" dominant-baseline="middle">1000</text>
      <text x="50%" y="68%" font-family="Arial, sans-serif" font-weight="900" font-size="${size*0.28}" fill="white" text-anchor="middle" dominant-baseline="middle">fps</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath} (${size}x${size})`);
}

async function generateShortcutIcon(name, outputPath) {
  const svg = `
    <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
      <rect width="96" height="96" rx="16" fill="#1a1a1a"/>
      <rect x="4" y="4" width="88" height="88" rx="12" fill="none" stroke="#ff6600" stroke-width="2"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-weight="700" font-size="14" fill="#ff6600" text-anchor="middle" dominant-baseline="middle">${name}</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .resize(96, 96)
    .png()
    .toFile(outputPath);

  console.log(`Created ${outputPath}`);
}

async function main() {
  // Main icons
  for (const size of sizes) {
    await generateIcon(size, `public/icons/icon-${size}x${size}.png`);
  }

  // Shortcut icons
  await generateShortcutIcon('Catalog', 'public/icons/shortcut-catalog.png');
  await generateShortcutIcon('Cart', 'public/icons/shortcut-cart.png');
  await generateShortcutIcon('Config', 'public/icons/shortcut-configurator.png');

  console.log('\nAll icons generated successfully!');
}

main().catch(console.error);
