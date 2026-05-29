const http = require('http');

function testAPI(problemId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 9002,
      path: `/api/problems/${problemId}`,
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${data.substring(0, 100)}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('Testing API endpoint for problems 1 and 2...\n');

    const problem1 = await testAPI(1);
    console.log('Problem 1:');
    console.log('- case_code exists:', problem1.problem?.case_code ? 'YES' : 'NO');
    if (problem1.problem?.case_code) {
      console.log('- case_code preview:', problem1.problem.case_code.substring(0, 80));
    }

    console.log('\nProblem 2:');
    const problem2 = await testAPI(2);
    console.log('- case_code exists:', problem2.problem?.case_code ? 'YES' : 'NO');
    if (problem2.problem?.case_code) {
      console.log('- case_code preview:', problem2.problem.case_code.substring(0, 80));
    }

  } catch (error) {
    console.error('Error testing API:', error.message);
    console.error('Make sure the dev server is running on port 9002');
  }
}

main();
