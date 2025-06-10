const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs').promises;
const redis = require('../utils/redis');

const app = express();

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images are allowed'));
  }
});

// Handle image upload and job creation
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    // Validate size parameters
    const { width, height } = req.body;
    if (!width || !height) {
      return res.status(400).json({ error: 'Width and height are required' });
    }
    const size = { width: parseInt(width), height: parseInt(height) };
    if (isNaN(size.width) || isNaN(size.height) || size.width <= 0 || size.height <= 0) {
      return res.status(400).json({ error: 'Width and height must be positive integers' });
    }

    // Generate unique job ID and file paths
    const jobId = uuidv4();
    const extension = path.extname(req.file.originalname);
    const inputPath = `uploads/${jobId}${extension}`;
    const outputPath = `output/${jobId}${extension}`;

    // Rename the uploaded file to include jobId
    await fs.rename(req.file.path, inputPath);

    // Create job object
    const job = {
      id: jobId,
      inputPath,
      outputPath,
      size
    };

    // Push job to Redis queue
    await redis.lpush('image_jobs', JSON.stringify(job));

    // Set initial status
    await redis.set(`job:${jobId}:status`, 'queued');

    // Return job ID to the client
    res.json({ jobId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check job status
app.get('/jobs/:id/status', async (req, res) => {
  const { id } = req.params;
  const status = await redis.get(`job:${id}:status`);
  if (status) {
    res.json({ status });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});