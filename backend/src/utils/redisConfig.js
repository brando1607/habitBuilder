import { createClient } from "redis";
import dotenv from "dotenv";
dotenv.config();

export const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

export const redisConnection = async () => {
  try {
    await client.connect();
    console.log("Connected to Redis server.");

    return client;
  } catch (error) {
    console.log("Not connected to Redis server.");
  }
};
