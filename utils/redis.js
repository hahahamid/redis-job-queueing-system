const Redis = require("ioredis");
require("dotenv").config();

// Create and export a Redis client instance
const redis = new Redis(process.env.REDIS_URL);
if (redis) {
  console.log("Connected to Redis");
}
module.exports = redis;
