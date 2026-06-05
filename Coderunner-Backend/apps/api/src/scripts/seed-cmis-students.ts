/**
 * Seed CMIS (Chandramari International School) student accounts.
 *
 * Scheme (confirmed with the owner):
 *  - username = firstname + last-token initial (collision-suffixed if needed), lowercase a-z only
 *  - password = the username (simple; students change later)
 *  - email    = <username>@cmis.local  (placeholder; unique, required by the model)
 *  - role     = student, age_group = 11-14 (Grades VII & VIII), onboardingComplete = false
 *  - NO classroom enrollment (accounts only)
 *
 * Idempotent: skips any username that already exists (never clobbers a password).
 * DRY-RUN by default — prints the username/password mapping and writes nothing.
 * Pass CONFIRM_CREATE=true to actually create the accounts.
 *
 * Run (from apps/api):
 *   npx tsx src/scripts/seed-cmis-students.ts                 # dry-run, prints mapping
 *   CONFIRM_CREATE=true npx tsx src/scripts/seed-cmis-students.ts   # creates
 */
import { Models, hashPassword } from '@code-runner/shared';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env.local') });

type Roster = { sr: number; name: string; grade: 'VII' | 'VIII' };

const ROSTER: Roster[] = [
  { sr: 1, name: 'Agharran J', grade: 'VII' },
  { sr: 2, name: 'Anika S', grade: 'VII' },
  { sr: 3, name: 'Anirudh Karthick', grade: 'VII' },
  { sr: 4, name: 'ARJUN B.V', grade: 'VII' },
  { sr: 5, name: 'Aurelia', grade: 'VII' },
  { sr: 6, name: 'Avika S', grade: 'VII' },
  { sr: 7, name: 'Ayush Arun', grade: 'VII' },
  { sr: 8, name: 'Blesslin Gladia K', grade: 'VII' },
  { sr: 9, name: 'Deekshan M', grade: 'VII' },
  { sr: 10, name: 'DHAKSIN S', grade: 'VII' },
  { sr: 11, name: 'DHANSHISH R', grade: 'VII' },
  { sr: 12, name: 'Dhanyata A', grade: 'VII' },
  { sr: 13, name: 'Dhiya Mythri K', grade: 'VII' },
  { sr: 14, name: 'Gnasiga B', grade: 'VII' },
  { sr: 15, name: 'Harwin Navaneeth', grade: 'VII' },
  { sr: 16, name: 'Iniyan Balakrishnan', grade: 'VII' },
  { sr: 17, name: 'JASHWIN SAI SAKTHI', grade: 'VII' },
  { sr: 18, name: 'JAYANTH SAI SAKTHI', grade: 'VII' },
  { sr: 19, name: 'Jyoshna M H', grade: 'VII' },
  { sr: 20, name: 'Kavin Karthik S J', grade: 'VII' },
  { sr: 21, name: 'KAVIN KRISHNA', grade: 'VII' },
  { sr: 22, name: 'Nikhilesh S', grade: 'VII' },
  { sr: 23, name: 'Ninitha Vishnukumar', grade: 'VII' },
  { sr: 24, name: 'Nithish C B', grade: 'VII' },
  { sr: 25, name: 'Oviyan S', grade: 'VII' },
  { sr: 26, name: 'Prajin B', grade: 'VII' },
  { sr: 27, name: 'Pranav P', grade: 'VII' },
  { sr: 28, name: 'Prinalia A', grade: 'VII' },
  { sr: 29, name: 'Sachin Saran S M', grade: 'VII' },
  { sr: 30, name: 'Sastiga P D', grade: 'VII' },
  { sr: 31, name: 'Sonnen Schein Keren Apbok S', grade: 'VII' },
  { sr: 32, name: 'Sudarshan S', grade: 'VII' },
  { sr: 33, name: 'Tishya', grade: 'VII' },
  { sr: 34, name: 'Venba Ranjith Kumar', grade: 'VII' },
  { sr: 35, name: 'Vishwesh Lakshmi Narayanan', grade: 'VII' },
  { sr: 36, name: 'AATHISH S', grade: 'VIII' },
  { sr: 37, name: 'Abinaya B', grade: 'VIII' },
  { sr: 38, name: 'Akil R P', grade: 'VIII' },
  { sr: 39, name: 'Alan Josh Micheal', grade: 'VIII' },
  { sr: 40, name: 'Aswath Kuber A G', grade: 'VIII' },
  { sr: 41, name: 'Aswin', grade: 'VIII' },
  { sr: 42, name: 'Bhavisha Nagaraj', grade: 'VIII' },
  { sr: 43, name: 'Dania Meryl', grade: 'VIII' },
  { sr: 44, name: 'Dhiya R', grade: 'VIII' },
  { sr: 45, name: 'Jaay Vishnu NK', grade: 'VIII' },
  { sr: 46, name: 'JANANI D', grade: 'VIII' },
  { sr: 47, name: 'Jeeth Aravindan', grade: 'VIII' },
  { sr: 48, name: 'Juan Aaraav Ravindharan', grade: 'VIII' },
  { sr: 49, name: 'Kaushika R M', grade: 'VIII' },
  { sr: 50, name: 'Lavankummar V', grade: 'VIII' },
  { sr: 51, name: 'M HARUNAMBIGA SRI', grade: 'VIII' },
  { sr: 52, name: 'Manya S M', grade: 'VIII' },
  { sr: 53, name: 'Mithula K S', grade: 'VIII' },
  { sr: 54, name: 'Monish H G', grade: 'VIII' },
  { sr: 55, name: 'Mridula S B', grade: 'VIII' },
  { sr: 56, name: 'Muthu Vedavasakan A', grade: 'VIII' },
  { sr: 57, name: 'NAVEETH M', grade: 'VIII' },
  { sr: 58, name: 'Niya Anand', grade: 'VIII' },
  { sr: 59, name: 'Prajith K', grade: 'VIII' },
  { sr: 60, name: 'Prathul R', grade: 'VIII' },
  { sr: 61, name: 'Pritul S Aryan', grade: 'VIII' },
  { sr: 62, name: 'Ragapriya K N', grade: 'VIII' },
  { sr: 63, name: 'Sahassra Shri S', grade: 'VIII' },
  { sr: 64, name: 'Sharan Adithya K V', grade: 'VIII' },
  { sr: 65, name: 'SHERWIN CHRIS S', grade: 'VIII' },
  { sr: 66, name: 'SUMANTH A', grade: 'VIII' },
  { sr: 67, name: 'Tashan Rajaneganth A', grade: 'VIII' },
];

/** firstname + last-token initial, lowercased, a-z only. Drops a leading single-letter initial. */
function baseUsername(name: string): string {
  let tokens = name.toLowerCase().split(/\s+/).map((t) => t.replace(/[^a-z]/g, '')).filter(Boolean);
  if (tokens.length === 0) return '';
  if (tokens[0].length <= 1 && tokens.length > 1) tokens = tokens.slice(1); // e.g. "M HARUNAMBIGA SRI" -> harunambiga…
  const first = tokens[0];
  const suffix = tokens.length >= 2 ? tokens[tokens.length - 1][0] : '';
  return first + suffix;
}

function assignUsernames(roster: Roster[]): Array<Roster & { username: string }> {
  const used = new Map<string, number>();
  return roster.map((r) => {
    const base = baseUsername(r.name);
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    const username = n === 0 ? base : `${base}${n + 1}`;
    return { ...r, username };
  });
}

async function main() {
  const rows = assignUsernames(ROSTER);
  const confirm = process.env.CONFIRM_CREATE === 'true';

  console.log(`\nCMIS student seed — ${rows.length} students — ${confirm ? 'CREATE MODE' : 'DRY-RUN (no writes)'}\n`);
  console.log('SR  USERNAME              PASSWORD              CLASS    NAME');
  for (const r of rows) {
    console.log(
      String(r.sr).padEnd(4) +
        r.username.padEnd(22) +
        r.username.padEnd(22) +
        `${r.grade}-A`.padEnd(9) +
        r.name
    );
  }

  if (!confirm) {
    console.log('\nDRY-RUN only. Re-run with CONFIRM_CREATE=true to create these accounts.');
    process.exit(0);
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) { console.error('❌ MONGODB_URI missing'); process.exit(1); }
  await mongoose.connect(mongoUri);
  console.log('\n✅ Connected to MongoDB');

  let created = 0, skipped = 0;
  for (const r of rows) {
    const existing = await Models.User.findOne({ username: r.username });
    if (existing) { skipped++; continue; }
    const passwordHash = await hashPassword(r.username); // password = username
    await new Models.User({
      username: r.username,
      email: `${r.username}@cmis.local`,
      passwordHash,
      age_group: '11-14',           // Grades VII & VIII
      role: 'student',
      selectedCharacter: 'astra',
      onboardingComplete: false,    // each student picks their character on first login
    }).save();
    created++;
  }

  console.log(`\n✅ Done. Created: ${created}, Skipped (already existed): ${skipped}.`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); });
