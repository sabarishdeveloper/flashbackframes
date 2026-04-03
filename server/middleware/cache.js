const { redisClient } = require('../config/redis');

/**
 * Cache middleware generator
 * @param {number} duration - Time to live (TTL) in seconds
 * @param {string} customPrefix - Optional prefix for the cache key
 */
const cacheData = (duration = 300, customPrefix = '') => {
    return async (req, res, next) => {
        // Only safely cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Generate a unique key based on URL & query params
        const key = `${customPrefix ? customPrefix + '_' : ''}${req.originalUrl}`;

        try {
            // Check if Redis is connected (fail openly if it crashes, to let DB handle it)
            if (!redisClient.isReady) {
                return next();
            }

            const cachedResponse = await redisClient.get(key);

            if (cachedResponse) {
                return res.status(200).json(JSON.parse(cachedResponse));
            } else {
                // Intercept the `res.json` method to automatically cache the payload
                const originalJson = res.json;
                res.json = function (body) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        redisClient.setEx(key, duration, JSON.stringify(body))
                            .catch(err => console.error('Redis Set Error:', err));
                    }
                    originalJson.call(this, body);
                };
                next();
            }
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            next(); // Proceed to DB if Cache fails
        }
    };
};

module.exports = cacheData;
