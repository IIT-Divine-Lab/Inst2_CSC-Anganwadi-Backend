const redis = require("redis");

// Create a Redis client
const redisClient = redis.createClient({
   socket: {
      host: "127.0.0.1", // Change if using a remote Redis server
      port: 6379,
   },
});

redisClient.connect();

redisClient.on("connect", () => {
   console.log("Connected to Redis");
});

redisClient.on("error", (err) => {
   console.error("Redis Error:", err);
});

const CACHE_EXPIRY = 60 * 60 * 8;

async function deleteSingleCache(cacheKey) {
   return await redisClient.del(cacheKey);
}

async function storeCache(cacheKey, data) {
   return await redisClient.setEx(cacheKey, CACHE_EXPIRY, JSON.stringify(data));
}

async function getCache(cacheKey) {
   return await redisClient.get(cacheKey);
}

module.exports = { redisClient, deleteSingleCache, storeCache, getCache }
