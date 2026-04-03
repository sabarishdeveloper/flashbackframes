const { redisClient } = require('../config/redis');

/**
 * Deletes all keys matching a specific pattern
 */
const clearCacheByPattern = async (pattern) => {
    try {
        if (!redisClient.isReady) return;
        
        // Find all keys matching the prefix pattern
        const keys = await redisClient.keys(`*${pattern}*`);
        
        if (keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (error) {
        console.error(`Error clearing cache for pattern ${pattern}:`, error);
    }
};

module.exports = { clearCacheByPattern };
