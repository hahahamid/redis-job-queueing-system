const redis = require("../utils/redis");
const { resizeImage } = require("../utils/imageProcessor");

/**
 * Continuously process jobs from the Redis queue
 */

async function processJobs() {
  console.log("worker has started processing jobs in the queue");

  while (true) {
    try {
      // Blocking pop from the right of the image_jobs list
      const jobData = await redis.brpop("image_jobs", 0);
      const job = JSON.parse(jobData[1]);
      const { id, inputPath, outputPath, size } = job;

      // Update status to processing
      await redis.set(`job:${id}:status`, "processing");
      
      try {
        // Process the image
        await resizeImage(inputPath, outputPath, size);
        // Update status to done
        await redis.set(`job:${id}:status`, "done");
      } catch (error) {
        console.error(`Error processing job ${id}:`, error);
        // Update status to failed
        await redis.set(`job:${id}:status`, "failed");
      }
    } catch (error) {
      console.error("Error in worker:", error);
      // Wait 1 second before retrying on error
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

// Start processing jobs
processJobs();
