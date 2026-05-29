import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/code-runner';
const MONGODB_DB = process.env.MONGODB_DB || 'code-runner';

async function seedProblem174() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const problemsCollection = db.collection('problems');
    const testCasesCollection = db.collection('test_cases');

    // Problem 174: Level 3, Session 9, Case 6 - Galactic AI Architects (Final Task)
    const problem174 = {
      problem_id: 174,
      session_id: 31, // Level 3, Session 9
      title: 'Galactic AI Architects – Engineering Multi-Tiered Intelligence',
      description: 'Multiple data streams are arriving at the bridge simultaneously. The Galactic Command needs composite AI minds that can blend translation, navigation, and defense operations seamlessly. Your mission is to architect an advanced HybridAI system that demonstrates the full power of multiple inheritance, hybrid hierarchies, method overriding, and intelligent behavior extension using super(). This AI must prove it can handle complex multi-tiered operations by choosing smarter strategies when needed.',
      difficulty: 'Hard',
      question: `Can you build a complete composite AI system demonstrating multiple inheritance, hybrid hierarchies, method overriding, and super()?`,      sample_input: 'Nova-1\nAsteroid Belt\nAlien Signals',
      sample_output: 'Navigating through space: Nova-1\nAnalyzing data streams: Nova-1\nBooting base AI system...\nPilot mode: Flying through Asteroid Belt\nScience mode: Researching Alien Signals\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',

      age_group: '11-14',
      level_number: 3,
      difficulty_level: 3,
      max_score: 100,

      metadata: {
        space_theme: true,
        concepts: ['multiple inheritance', 'hybrid inheritance', 'method overriding', 'super()', 'class hierarchy', 'composite AI', 'multilevel inheritance', 'OOP'],
        estimated_time_minutes: 30
      },

      // Session-level content
      session_title: 'Session 9: Mastering Inheritance - Advanced',

      // Case-specific content
      case_number: 6,
      case_title: 'Galactic AI Architects – Engineering Multi-Tiered Intelligence',
      case_overview: `Demonstrate complete inheritance mastery with multiple inheritance, hybrid hierarchies, method overriding, and super().`,
      case_explanation: `Build composite AI using multiple inheritance patterns, method overriding, and super() for advanced functionality.`,

      created_at: new Date(),
      updated_at: new Date()
    };

    // Delete existing problem 174 if it exists
    await problemsCollection.deleteOne({ problem_id: 174 });
    await testCasesCollection.deleteMany({ problem_id: 174 });

    // Insert problem 174
    const problemResult = await problemsCollection.insertOne(problem174);
    console.log('Problem 174 inserted');

    // Test cases for Problem 174 (7 test cases for final task)
    const testCases = [
      // Visible test cases
      {
        test_case_id: 1741,
        problem_id: 174,
        input: 'Nova-1\nAsteroid Belt\nAlien Signals',
        expected_output: 'Navigating through space: Nova-1\nAnalyzing data streams: Nova-1\nBooting base AI system...\nPilot mode: Flying through Asteroid Belt\nScience mode: Researching Alien Signals\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: false,
        weight: 10
      },
      {
        test_case_id: 1742,
        problem_id: 174,
        input: 'Alpha-7\nNebula Zone\nCosmic Radiation',
        expected_output: 'Navigating through space: Alpha-7\nAnalyzing data streams: Alpha-7\nBooting base AI system...\nPilot mode: Flying through Nebula Zone\nScience mode: Researching Cosmic Radiation\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: false,
        weight: 10
      },
      // Hidden test cases
      {
        test_case_id: 1743,
        problem_id: 174,
        input: 'Titan-3\nWormhole Sector\nDark Matter',
        expected_output: 'Navigating through space: Titan-3\nAnalyzing data streams: Titan-3\nBooting base AI system...\nPilot mode: Flying through Wormhole Sector\nScience mode: Researching Dark Matter\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1744,
        problem_id: 174,
        input: 'Orion-9\nGalaxy Edge\nQuantum Fields',
        expected_output: 'Navigating through space: Orion-9\nAnalyzing data streams: Orion-9\nBooting base AI system...\nPilot mode: Flying through Galaxy Edge\nScience mode: Researching Quantum Fields\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1745,
        problem_id: 174,
        input: 'Phoenix-2\nSolar Flare Region\nPlasma Storms',
        expected_output: 'Navigating through space: Phoenix-2\nAnalyzing data streams: Phoenix-2\nBooting base AI system...\nPilot mode: Flying through Solar Flare Region\nScience mode: Researching Plasma Storms\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1746,
        problem_id: 174,
        input: 'Vega-5\nMeteor Shower\nGravity Waves',
        expected_output: 'Navigating through space: Vega-5\nAnalyzing data streams: Vega-5\nBooting base AI system...\nPilot mode: Flying through Meteor Shower\nScience mode: Researching Gravity Waves\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: true,
        weight: 16
      },
      {
        test_case_id: 1747,
        problem_id: 174,
        input: 'Zenith-8\nBlack Hole Proximity\nTime Dilation',
        expected_output: 'Navigating through space: Zenith-8\nAnalyzing data streams: Zenith-8\nBooting base AI system...\nPilot mode: Flying through Black Hole Proximity\nScience mode: Researching Time Dilation\nHybridAI Report: Multi-stream analysis complete.\nInitializing systems...\nAdvanced protocols loaded.',
        is_hidden: true,
        weight: 16
      }
    ];

    // Insert test cases
    await testCasesCollection.insertMany(testCases);
    console.log(`${testCases.length} test cases inserted for Problem 174`);

    console.log('\n✅ Problem 174 (Level 3, Session 9, Case 6: Galactic AI Architects - FINAL TASK) seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedProblem174()
  .then(() => {
    console.log('\n🚀 Database seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  });
