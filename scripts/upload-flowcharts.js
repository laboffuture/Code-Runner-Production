/**
 * Cloudinary Flowchart Uploader
 * Uploads Level 1 (sessions 1-10) and Level 2 (sessions 1-10) flowchart images.
 * Destination pattern: code-runner/flowcharts/11-14/level-{L}/session-{S}/flow-{F}
 *
 * Run: node scripts/upload-flowcharts.js
 */

const https  = require('https');
const crypto = require('crypto');
const fs     = require('fs');
const path   = require('path');

// ── Cloudinary credentials ──────────────────────────────────────────────────
const CLOUD_NAME = 'dwqzqxeuk';
const API_KEY    = '832957294683644';
const API_SECRET = 'mi4Im0bSEmsJZiL9ZFMJeI2gduU';
const BASE       = 'D:\\LOF\\PROJECTS\\PRODUCTION\\Flowcharts';

// ── File manifest ────────────────────────────────────────────────────────────
// Each entry: { level, session, flow, file }
// level and session are 1-based positions (session = position within that level)
const MANIFEST = [
  // ── LEVEL 1 ──────────────────────────────────────────────────────────────
  // Session 1
  { level: 1, session: 1, flow: 1, file: 'Level 1\\Session_1\\S1 Flow - 01.png' },
  { level: 1, session: 1, flow: 2, file: 'Level 1\\Session_1\\S1 Flow - 02.png' },
  { level: 1, session: 1, flow: 3, file: 'Level 1\\Session_1\\S1 Flow - 03.png' },
  { level: 1, session: 1, flow: 4, file: 'Level 1\\Session_1\\S1 Flow - 04.png' },
  { level: 1, session: 1, flow: 5, file: 'Level 1\\Session_1\\S1 Flow - 05.png' },
  // Session 2
  { level: 1, session: 2, flow: 1, file: 'Level 1\\Session_2\\S2 Flow - case 01.png' },
  { level: 1, session: 2, flow: 2, file: 'Level 1\\Session_2\\S2 Flow -case 02.png' },
  { level: 1, session: 2, flow: 3, file: 'Level 1\\Session_2\\S2 Flow - case 03.png' },
  { level: 1, session: 2, flow: 4, file: 'Level 1\\Session_2\\S2 Flow - case 04.png' },
  { level: 1, session: 2, flow: 5, file: 'Level 1\\Session_2\\S2 Flow -case 05.png' },
  // Session 3
  { level: 1, session: 3, flow: 1, file: 'Level 1\\Session_3\\new\\case 01.png'  },
  { level: 1, session: 3, flow: 2, file: 'Level 1\\Session_3\\new\\case 02.png'  },
  { level: 1, session: 3, flow: 3, file: 'Level 1\\Session_3\\new\\case 03.webp' }, // webp original
  { level: 1, session: 3, flow: 4, file: 'Level 1\\Session_3\\new\\case 04.png'  },
  { level: 1, session: 3, flow: 5, file: 'Level 1\\Session_3\\new\\case 05.png'  },
  // Session 4
  { level: 1, session: 4, flow: 1, file: 'Level 1\\Session_4\\PNG\\S4-Flow-1.png' },
  { level: 1, session: 4, flow: 2, file: 'Level 1\\Session_4\\PNG\\S4-Flow-2.png' },
  { level: 1, session: 4, flow: 3, file: 'Level 1\\Session_4\\PNG\\S4-Flow-3.png' },
  { level: 1, session: 4, flow: 4, file: 'Level 1\\Session_4\\PNG\\S4-Flow-4.png' },
  { level: 1, session: 4, flow: 5, file: 'Level 1\\Session_4\\PNG\\S4-Flow-5.png' },
  // Session 5
  { level: 1, session: 5, flow: 1, file: 'Level 1\\Session_5\\PNG\\Flow 1 copy.png' },
  { level: 1, session: 5, flow: 2, file: 'Level 1\\Session_5\\PNG\\Flow 2 copy.png' },
  { level: 1, session: 5, flow: 3, file: 'Level 1\\Session_5\\PNG\\Flow 3 copy.png' },
  { level: 1, session: 5, flow: 4, file: 'Level 1\\Session_5\\PNG\\Flow 4 copy.png' },
  { level: 1, session: 5, flow: 5, file: 'Level 1\\Session_5\\PNG\\Flow 5 copy.png' },
  // Session 6
  { level: 1, session: 6, flow: 1, file: 'Level 1\\Session_6\\S6_flow_1.png' },
  { level: 1, session: 6, flow: 2, file: 'Level 1\\Session_6\\S6_flow_2.png' },
  { level: 1, session: 6, flow: 3, file: 'Level 1\\Session_6\\S6_flow_3.png' },
  { level: 1, session: 6, flow: 4, file: 'Level 1\\Session_6\\S6_flow_4.png' },
  { level: 1, session: 6, flow: 5, file: 'Level 1\\Session_6\\S6_flow_5.png' },
  // Session 7
  { level: 1, session: 7, flow: 1, file: 'Level 1\\Session_7\\new\\case 01.png'  },
  { level: 1, session: 7, flow: 2, file: 'Level 1\\Session_7\\new\\case 02.png'  },
  { level: 1, session: 7, flow: 3, file: 'Level 1\\Session_7\\new\\case 03.webp' }, // webp original
  { level: 1, session: 7, flow: 4, file: 'Level 1\\Session_7\\new\\case 04.png'  },
  { level: 1, session: 7, flow: 5, file: 'Level 1\\Session_7\\new\\case 05.png'  },
  // Session 8
  { level: 1, session: 8, flow: 1, file: 'Level 1\\Session_8\\png\\S8 Flow - case 01.png' },
  { level: 1, session: 8, flow: 2, file: 'Level 1\\Session_8\\png\\S8 Flow - case 02.png' },
  { level: 1, session: 8, flow: 3, file: 'Level 1\\Session_8\\png\\S8 Flow - case 03.png' },
  { level: 1, session: 8, flow: 4, file: 'Level 1\\Session_8\\png\\S8 Flow - case 04.png' },
  { level: 1, session: 8, flow: 5, file: 'Level 1\\Session_8\\png\\S8 - Flow -05.png'     },
  // Session 9
  { level: 1, session: 9, flow: 1, file: 'Level 1\\Session_9\\new\\case 01.png' },
  { level: 1, session: 9, flow: 2, file: 'Level 1\\Session_9\\new\\case 02.png' },
  { level: 1, session: 9, flow: 3, file: 'Level 1\\Session_9\\new\\case 03.png' },
  { level: 1, session: 9, flow: 4, file: 'Level 1\\Session_9\\new\\case 04.png' },
  { level: 1, session: 9, flow: 5, file: 'Level 1\\Session_9\\new\\case 05.png' },
  // Session 10
  { level: 1, session: 10, flow: 1, file: 'Level 1\\Session_10\\PNG\\S10-Flow-1.png' },
  { level: 1, session: 10, flow: 2, file: 'Level 1\\Session_10\\PNG\\S10-Flow-2.png' },
  { level: 1, session: 10, flow: 3, file: 'Level 1\\Session_10\\PNG\\S10-Flow-3.png' },
  { level: 1, session: 10, flow: 4, file: 'Level 1\\Session_10\\PNG\\S10-Flow-4.png' },
  { level: 1, session: 10, flow: 5, file: 'Level 1\\Session_10\\PNG\\S10-Flow-5.png' },

  // ── LEVEL 2 (using "review 2" as canonical final version) ─────────────────
  // Session 1
  { level: 2, session: 1, flow: 1, file: 'Level 2\\review 2\\session 1\\S1---Flow---01.png' },
  { level: 2, session: 1, flow: 2, file: 'Level 2\\review 2\\session 1\\S1---Flow---02.png' },
  { level: 2, session: 1, flow: 3, file: 'Level 2\\review 2\\session 1\\S1---Flow---03.png' },
  { level: 2, session: 1, flow: 4, file: 'Level 2\\review 2\\session 1\\S1---Flow---04.png' },
  { level: 2, session: 1, flow: 5, file: 'Level 2\\review 2\\session 1\\S1---Flow---05.png' },
  // Session 2
  { level: 2, session: 2, flow: 1, file: 'Level 2\\review 2\\Session 2\\1 copy.webp' },
  { level: 2, session: 2, flow: 2, file: 'Level 2\\review 2\\Session 2\\2 copy.webp' },
  { level: 2, session: 2, flow: 3, file: 'Level 2\\review 2\\Session 2\\3 copy.webp' },
  { level: 2, session: 2, flow: 4, file: 'Level 2\\review 2\\Session 2\\4 copy.webp' },
  { level: 2, session: 2, flow: 5, file: 'Level 2\\review 2\\Session 2\\5 copy.webp' },
  // Session 3
  { level: 2, session: 3, flow: 1, file: 'Level 2\\review 2\\Session 3\\1 copy.webp' },
  { level: 2, session: 3, flow: 2, file: 'Level 2\\review 2\\Session 3\\2 copy.webp' },
  { level: 2, session: 3, flow: 3, file: 'Level 2\\review 2\\Session 3\\3 copy.webp' },
  { level: 2, session: 3, flow: 4, file: 'Level 2\\review 2\\Session 3\\4 copy.webp' },
  { level: 2, session: 3, flow: 5, file: 'Level 2\\review 2\\Session 3\\5 copy.webp' },
  // Session 4
  { level: 2, session: 4, flow: 1, file: 'Level 2\\review 2\\session 4\\S4---Flow---01.png' },
  { level: 2, session: 4, flow: 2, file: 'Level 2\\review 2\\session 4\\S4---Flow---02.png' },
  { level: 2, session: 4, flow: 3, file: 'Level 2\\review 2\\session 4\\S4---Flow---03.png' },
  { level: 2, session: 4, flow: 4, file: 'Level 2\\review 2\\session 4\\S4---Flow---04.png' },
  { level: 2, session: 4, flow: 5, file: 'Level 2\\review 2\\session 4\\S4---Flow---05.png' },
  // Session 5
  { level: 2, session: 5, flow: 1, file: 'Level 2\\review 2\\session 5\\S5---Flow---01.png' },
  { level: 2, session: 5, flow: 2, file: 'Level 2\\review 2\\session 5\\S5---Flow---02.png' },
  { level: 2, session: 5, flow: 3, file: 'Level 2\\review 2\\session 5\\S5---Flow---03.png' },
  { level: 2, session: 5, flow: 4, file: 'Level 2\\review 2\\session 5\\S5---Flow---04.png' },
  { level: 2, session: 5, flow: 5, file: 'Level 2\\review 2\\session 5\\S5---Flow---05.png' },
  // Session 6
  { level: 2, session: 6, flow: 1, file: 'Level 2\\review 2\\session 6\\S6---Flow---01.png' },
  { level: 2, session: 6, flow: 2, file: 'Level 2\\review 2\\session 6\\S6---Flow---02.png' },
  { level: 2, session: 6, flow: 3, file: 'Level 2\\review 2\\session 6\\S6---Flow---03.png' },
  { level: 2, session: 6, flow: 4, file: 'Level 2\\review 2\\session 6\\S6---Flow---04.png' },
  { level: 2, session: 6, flow: 5, file: 'Level 2\\review 2\\session 6\\S6---Flow---05.png' },
  // Session 7 (files are misnamed S6 in the folder but belong to session 7)
  { level: 2, session: 7, flow: 1, file: 'Level 2\\review 2\\session 7\\S6---Flow---01.png' },
  { level: 2, session: 7, flow: 2, file: 'Level 2\\review 2\\session 7\\S6---Flow---02.png' },
  { level: 2, session: 7, flow: 3, file: 'Level 2\\review 2\\session 7\\S6---Flow---03.png' },
  { level: 2, session: 7, flow: 4, file: 'Level 2\\review 2\\session 7\\S6---Flow---04.png' },
  { level: 2, session: 7, flow: 5, file: 'Level 2\\review 2\\session 7\\S6---Flow---05.png' },
  // Session 8 (folder has triple-s typo: sesssion)
  { level: 2, session: 8, flow: 1, file: 'Level 2\\review 2\\sesssion 8\\S8---Flow---01.png' },
  { level: 2, session: 8, flow: 2, file: 'Level 2\\review 2\\sesssion 8\\S8---Flow---02.png' },
  { level: 2, session: 8, flow: 3, file: 'Level 2\\review 2\\sesssion 8\\S8---Flow---03.png' },
  { level: 2, session: 8, flow: 4, file: 'Level 2\\review 2\\sesssion 8\\S8---Flow---04.png' },
  { level: 2, session: 8, flow: 5, file: 'Level 2\\review 2\\sesssion 8\\S8---Flow---05.png' },
  // Session 9
  { level: 2, session: 9, flow: 1, file: 'Level 2\\review 2\\Session 9\\1 copy.webp' },
  { level: 2, session: 9, flow: 2, file: 'Level 2\\review 2\\Session 9\\2 copy.webp' },
  { level: 2, session: 9, flow: 3, file: 'Level 2\\review 2\\Session 9\\3 copy.webp' },
  { level: 2, session: 9, flow: 4, file: 'Level 2\\review 2\\Session 9\\4 copy.webp' },
  { level: 2, session: 9, flow: 5, file: 'Level 2\\review 2\\Session 9\\5 copy.webp' },
  // Session 10
  { level: 2, session: 10, flow: 1, file: 'Level 2\\review 2\\Session 10\\1 copy.webp' },
  { level: 2, session: 10, flow: 2, file: 'Level 2\\review 2\\Session 10\\2 copy.webp' },
  { level: 2, session: 10, flow: 3, file: 'Level 2\\review 2\\Session 10\\3 copy.webp' },
  { level: 2, session: 10, flow: 4, file: 'Level 2\\review 2\\Session 10\\4 copy.webp' },
  { level: 2, session: 10, flow: 5, file: 'Level 2\\review 2\\Session 10\\5 copy.webp' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === '.webp' ? 'image/webp' : 'image/png';
}

function buildPublicId(level, session, flow) {
  return `code-runner/flowcharts/11-14/level-${level}/session-${session}/flow-${flow}`;
}

function sign(params) {
  const sorted = Object.keys(params).sort();
  const str    = sorted.map(k => `${k}=${params[k]}`).join('&') + API_SECRET;
  return crypto.createHash('sha1').update(str).digest('hex');
}

function uploadFile(entry) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(BASE, entry.file);

    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType   = getMimeType(filePath);
    const publicId   = buildPublicId(entry.level, entry.session, entry.flow);
    const timestamp  = Math.round(Date.now() / 1000).toString();

    const signParams = { overwrite: 'true', public_id: publicId, timestamp };
    const signature  = sign(signParams);
    const boundary   = 'CF' + crypto.randomBytes(16).toString('hex');

    // Build multipart body
    const textFields = { api_key: API_KEY, signature, ...signParams };
    const parts = [];

    for (const [k, v] of Object.entries(textFields)) {
      parts.push(
        `--${boundary}\r\n` +
        `Content-Disposition: form-data; name="${k}"\r\n\r\n` +
        `${v}`
      );
    }

    const fileHeader =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${path.basename(filePath)}"\r\n` +
      `Content-Type: ${mimeType}\r\n\r\n`;

    const bodyHead = Buffer.from(parts.join('\r\n') + '\r\n' + fileHeader);
    const bodyTail = Buffer.from(`\r\n--${boundary}--\r\n`);
    const body     = Buffer.concat([bodyHead, fileBuffer, bodyTail]);

    const options = {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };

    const req = https.request(options, res => {
      let raw = '';
      res.on('data', chunk => (raw += chunk));
      res.on('end', () => {
        try {
          const result = JSON.parse(raw);
          resolve({ entry, result });
        } catch (e) {
          reject(new Error(`JSON parse error: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\nUploading ${MANIFEST.length} flowchart images to Cloudinary...\n`);

  const results   = [];
  const failures  = [];
  let   uploaded  = 0;

  for (const entry of MANIFEST) {
    const label = `L${entry.level} S${entry.session} F${entry.flow}`;
    process.stdout.write(`[${++uploaded}/${MANIFEST.length}] ${label} — `);

    try {
      const { result } = await uploadFile(entry);

      if (result.error) {
        console.log(`ERROR: ${result.error.message}`);
        failures.push({ entry, error: result.error.message });
      } else {
        console.log(`OK  ${result.secure_url}`);
        results.push({
          label,
          level:   entry.level,
          session: entry.session,
          flow:    entry.flow,
          url:     result.secure_url,
          publicId: result.public_id,
          format:  result.format,
          width:   result.width,
          height:  result.height,
          bytes:   result.bytes,
        });
      }
    } catch (err) {
      console.log(`FAIL: ${err.message}`);
      failures.push({ entry, error: err.message });
    }

    // Small pause between uploads to be respectful to the API
    await new Promise(r => setTimeout(r, 300));
  }

  // Write results to JSON
  const outPath = path.join(__dirname, 'flowchart-upload-results.json');
  fs.writeFileSync(outPath, JSON.stringify({ results, failures }, null, 2));

  console.log(`\n✓ Done. ${results.length} uploaded, ${failures.length} failed.`);
  console.log(`Results saved to: ${outPath}`);

  if (failures.length > 0) {
    console.log('\nFailed files:');
    failures.forEach(f => console.log(`  L${f.entry.level} S${f.entry.session} F${f.entry.flow}: ${f.error}`));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
