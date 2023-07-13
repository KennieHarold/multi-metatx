import dotenv from 'dotenv';

dotenv.config();

export default {
  port: 8080,
  host: 'localhost',
  baseApiUrl: '/api/v1',
  jobInterval: 5, // in minutes
  privKey: process.env.PRIV_KEY,
  rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379'
};
