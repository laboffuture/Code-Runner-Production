/**
 * Seed a few clearly-labelled SAMPLE store items so the store preview looks alive.
 * Idempotent: upserts by name. Run: npx tsx apps/api/scripts/seed-store-items.ts
 * (from Coderunner-Backend, with .env.local present).
 */
import { connectToDatabase, Models } from '@code-runner/shared';

const SAMPLE_ITEMS = [
  { name: '[Sample] Sticker Pack',    description: 'A set of Coderunner character stickers.', priceCoins: 20,  category: 'sticker' as const, stock: null },
  { name: '[Sample] Astra Sticker',   description: 'Astra the AI Agent, in vinyl.',           priceCoins: 15,  category: 'sticker' as const, stock: null },
  { name: '[Sample] Laptop Cover',    description: 'A Coderunner-branded laptop cover.',       priceCoins: 300, category: 'merch' as const,   stock: 10   },
  { name: '[Sample] Enamel Pin',      description: 'A collectible Novas ✨ enamel pin.',        priceCoins: 120, category: 'merch' as const,   stock: 25   },
];

async function seed() {
  await connectToDatabase();
  console.log('✅ Connected. Seeding sample store items…\n');
  for (const item of SAMPLE_ITEMS) {
    await Models.StoreItem.updateOne(
      { name: item.name },
      { $set: { ...item, active: true } },
      { upsert: true }
    );
    console.log(`   • ${item.name} (✨${item.priceCoins})`);
  }
  const count = await Models.StoreItem.countDocuments({ active: true });
  console.log(`\n✅ Done. ${count} active store item(s).`);
  process.exit(0);
}

seed().catch((err) => { console.error('❌ Seed failed:', err); process.exit(1); });
