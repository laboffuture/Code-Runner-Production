/**
 * Focused, MERGE-SAFE Cloudinary uploader for character "view" backgrounds
 * (the before-entering + inside-backdrop images under public/assets/view/<char>).
 *
 * Unlike upload-to-cloudinary.js (which regenerates the whole URL map from scratch,
 * so it must re-upload everything), this uploads ONLY the listed files at ORIGINAL
 * quality (transformation: [], overwrite: true) and MERGES them into
 * cloudinary-urls.json without touching any other entry.
 *
 * Reference the results in code via getCloudinaryImage('view/kenji/11-14') etc.
 *
 * Usage (from Coderunner-Frontend/web):  node scripts/upload-view.js
 */
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Reuse the existing committed Cloudinary credentials (single source of truth) —
// extract at runtime so the secret is not duplicated into this file.
const baseScript = fs.readFileSync(path.join(__dirname, 'upload-to-cloudinary.js'), 'utf8');
const pick = (k) => (baseScript.match(new RegExp(k + ":\\s*'([^']+)'")) || [])[1];
cloudinary.config({ cloud_name: pick('cloud_name'), api_key: pick('api_key'), api_secret: pick('api_secret') });

const PUBLIC_DIR = path.join(__dirname, '../public');

// public_id (under code-runner/) is referenced in code as getCloudinaryImage(<id-without-code-runner/>).
// KEEP IN SYNC with src/lib/view-backgrounds.ts (AVAILABLE_VIEW): each publicId
// 'code-runner/view/<key>' uploaded here must be listed there as '<key>' for the
// app to actually use it (otherwise it falls back to the default image).
const FILES = [
  { local: 'assets/view/kenji/11-14.png',                       publicId: 'code-runner/view/kenji/11-14' },
  { local: 'assets/view/kenji/15-18.png',                       publicId: 'code-runner/view/kenji/15-18' },
  { local: 'assets/view/kenji/INSIDE 11-14/kenji-home-bg.png',  publicId: 'code-runner/view/kenji/inside-11-14' },
];

async function main() {
  const mapPath = path.join(__dirname, 'cloudinary-urls.json');
  const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};

  for (const f of FILES) {
    const filePath = path.join(PUBLIC_DIR, f.local);
    if (!fs.existsSync(filePath)) { console.log('  MISSING:', f.local); continue; }
    const res = await cloudinary.uploader.upload(filePath, {
      public_id: f.publicId, resource_type: 'image', overwrite: true, transformation: [],
    });
    map['/' + f.local] = { url: res.secure_url, publicId: res.public_id, resourceType: 'image' };
    console.log('  UPLOADED:', f.publicId, '->', res.secure_url, `(${res.width}x${res.height})`);
  }

  fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
  console.log('\nMerged into', path.basename(mapPath), '— no other entries touched.');
  console.log('Reference in code via: getCloudinaryImage(\'view/kenji/11-14\'), \'view/kenji/15-18\', \'view/kenji/inside-11-14\'');
}

main().catch((e) => { console.error('Upload failed:', e.message); process.exit(1); });
