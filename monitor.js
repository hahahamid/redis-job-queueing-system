const redis = require('./utils/redis');

async function monitor() {
  try {
    // Get the number of jobs in the queue
    const queueLength = await redis.llen('image_jobs');
    console.log(`Queue length: ${queueLength}`);

    // Get all job IDs from the 'all_jobs' set
    const jobIds = await redis.smembers('all_jobs');
    console.log('All jobs:');

    for (const jobId of jobIds) {
      // Get job details from the hash
      const job = await redis.hgetall(`job:${jobId}`);
      if (job) {
        console.log(`Job ${job.id}: status: ${job.status}, inputPath: ${job.inputPath}, outputPath: ${job.outputPath}, size: ${job.size}`);
      } else {
        console.log(`Job ${jobId}: not found`);
      }
    }
  } catch (error) {
    console.error('Error monitoring jobs:', error);
  } finally {
    await redis.quit();
  }
}

// Run the monitor function and exit
monitor().then(() => process.exit(0)).catch(console.error);