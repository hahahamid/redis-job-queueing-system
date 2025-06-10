# Redis Image Processing Queue

A Node.js project that uses Redis to manage a background job queue for resizing images. Built to get hands-on with Redis, this system queues image processing tasks, tracks their status in real-time, and saves resized images locally. It’s a minimal yet production-ready setup to explore Redis’s power for distributed systems.

## Features

- Redis-Powered Queue: Uses Redis lists (LPUSH, BRPOP) to manage image processing jobs efficiently.
- Real-Time Status Tracking: Stores job statuses (queued, processing, done, failed) in Redis for instant monitoring.
- Scalable Worker: Background worker processes jobs using the Sharp library for image resizing.
- Test Script: Automates uploading multiple images and tracks job progress, with output folder cleanup.
- Modular Design: Organized codebase with separate API, worker, and utility modules.


## Prerequisites

- Node.js (v14 or higher)
- Redis (running locally)
- npm (comes with Node.js)

### Setup

Clone the Repository (or set up manually):
```bash
git clone https://github.com/hahahamid/redis-job-queueing-system
cd redis-job-system
```

### Install Dependencies:
```bash
npm install express multer ioredis sharp uuid dotenv axios form-data
```


### Configure Environment:

Create a .env file in the root:
```
REDIS_URL=redis://localhost:6379
```



Create Directories:
```
mkdir -p uploads output test_images
```

- Add sample images (.jpg, .png, .gif) to test_images/ for testing.


Start Redis:
```
redis-server
```


### Running the System

1. Start the API Server (in one terminal):
```
node api/index.js
```

- Runs on http://localhost:3000.


2. Start the Worker (in another terminal):
```
node worker/index.js
```

- Processes jobs from the Redis queue.


3. Test with Multiple Images:

- Ensure test_images/ has images.
```
Run the test script:node test_upload.js
```

- This clears the output/ folder, uploads images, and shows job statuses (queued, processing, done, failed) until all jobs complete.


## How It Works

- Uploading: The API (api/index.js) accepts image uploads, saves them to uploads/, and pushes job IDs to a Redis list (image_jobs) using LPUSH.

- Processing: The worker (worker/index.js) uses BRPOP to pull jobs from Redis, resizes images with Sharp, and saves them to output/. Job statuses are stored in Redis keys (job:<id>:status).

- Testing: The test_upload.js script uploads multiple images, clears the output/ folder, and monitors job statuses in real-time, showing how Redis manages the queue.

- Redis Focus: Redis is the heart of the system, handling queue operations and status tracking with commands like LPUSH, BRPOP, SET, and GET.
