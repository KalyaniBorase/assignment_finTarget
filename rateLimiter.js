const rateLimit = require('express-rate-limit');
const Redis = require('redis');
const { RateLimitRedis } = require('rate-limit-redis');

// Create a Redis client
const redisClient = Redis.createClient({
  host: '127.0.0.1',
  port: 6379
});

// Handle Redis connection errors
redisClient.on('error', (err) => {
  console.error('Redis error: ', err);
});

// Rate limiting middleware
const limiter = rateLimit({
  store: new RateLimitRedis({
    client: redisClient,
    // Set expiration time in seconds for rate limit records in Redis
    expiry: 60 // 1 minute
  }),
  windowMs: 1000, // 1 second window
  max: 1, // limit each user to 1 request per windowMs
  message: "Too many requests, please try again later.",
  keyGenerator: (req) => req.body.user_id, // Use user_id as the key
  handler: async (req, res, next) => {
    const userId = req.body.user_id;

    // Increment the counter for the minute window
    const currentCount = await redisClient.incrAsync(`${userId}_min`);

    if (currentCount > 20) {
      return res.status(429).send({ message: "Rate limit exceeded, try again later." });
    } else {
      next();
    }
  }
});

module.exports = limiter;
