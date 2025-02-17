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

module.exports = redisClient;
