// Test if BullMQ properly preserves actual newlines in job data
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

async function test() {
  const connection = new Redis({ host: 'localhost', port: 6379, maxRetriesPerRequest: null });

  const queue = new Queue('test-newline-queue', { connection });

  // Add a job with actual newline
  const testInput = 'Anya\n7th'; // actual newline
  console.log('Input hex before queuing:', Buffer.from(testInput).toString('hex'));
  console.log('Input repr before queuing:', JSON.stringify(testInput));

  const job = await queue.add('test-job', { input: testInput }, { jobId: 'test-1' });
  console.log('Job added, id:', job.id);

  // Read the raw Redis data to see how it's stored
  const rawData = await connection.hget('bull:test-newline-queue:1', 'data');
  console.log('\nRaw Redis data:', rawData);

  // Parse and check
  if (rawData) {
    const parsed = JSON.parse(rawData);
    console.log('Parsed input hex:', Buffer.from(parsed.input).toString('hex'));
    console.log('Parsed input repr:', JSON.stringify(parsed.input));
    const hasActualNewline = parsed.input.includes('\n');
    const hasLiteralBackslashN = parsed.input.includes('\\n');
    console.log('Has actual newline:', hasActualNewline);
    console.log('Has literal backslash-n:', hasLiteralBackslashN);
  }

  // Clean up
  await queue.drain();
  await queue.close();
  connection.disconnect();
}

test().catch(console.error);
