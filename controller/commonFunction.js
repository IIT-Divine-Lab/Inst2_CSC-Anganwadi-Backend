const redisClient = require("../cache/redisClient");
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

module.exports = { deleteSingleCache, storeCache, getCache }