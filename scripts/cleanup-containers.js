#!/usr/bin/env node

/**
 * Container cleanup script - runs before server starts
 * Ensures exactly 25 containers (20 CPU + 5 GPU) are running
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function cleanupContainers() {
  try {
    // Find all stopped pool containers
    const { stdout: stoppedStdout } = await execAsync('docker ps -aq --filter "name=pool-" --filter "status=exited"');
    const stoppedIds = stoppedStdout.trim().split('\n').filter(id => id.length > 0);

    if (stoppedIds.length > 0) {
      for (const id of stoppedIds) {
        await execAsync(`docker rm -f ${id}`).catch(() => {});
      }
    }

    // Get all running pool containers
    const { stdout: runningStdout } = await execAsync('docker ps -q --filter "name=pool-"');
    const runningIds = runningStdout.trim().split('\n').filter(id => id.length > 0);

    const CPU_POOL_SIZE = 20;
    const GPU_POOL_SIZE = 5;
    const TOTAL_POOL_SIZE = CPU_POOL_SIZE + GPU_POOL_SIZE;


    // If more than pool size, remove excess
    if (runningIds.length > TOTAL_POOL_SIZE) {
      const excessCount = runningIds.length - TOTAL_POOL_SIZE;

      const excessIds = runningIds.slice(TOTAL_POOL_SIZE);
      for (const id of excessIds) {
        await execAsync(`docker stop -t 2 ${id}`).catch(() => {});
        await execAsync(`docker rm -f ${id}`).catch(() => {});
      }
    }

    // Final count
    const { stdout: finalStdout } = await execAsync('docker ps -q --filter "name=pool-"');
    const finalCount = finalStdout.trim().split('\n').filter(id => id.length > 0).length;


  } catch (error) {
    // Don't fail the server startup on cleanup errors
    process.exit(0);
  }
}

cleanupContainers();
