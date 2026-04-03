const { createClient } = require('redis');

// Use Render's internal Redis URL if deployed, otherwise fallback to local or cloud URL
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 10) {
                console.error('Redis connection failed after 10 retries.');
                return new Error('Redis connection failed.');
            }
            // Exponential backoff strategy
            return Math.min(retries * 50, 2000); 
        }
    }
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));
redisClient.on('ready', () => console.log('Redis Client Ready'));

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Failed to connect to Redis', err);
    }
};

module.exports = { redisClient, connectRedis };
