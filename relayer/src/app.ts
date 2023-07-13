import express from 'express';
import { createServer } from 'http';
import config from 'config';
import cors from 'cors';
import { log } from '@/utils/logger';
import { TransactionRouter } from '@/routers/transactionRouter';
import RedisService from '@/services/redisService';
import { bundleTransactionsRunner } from '@/jobs/transactionJob';

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.set('trust proxy', 1);
app.use(cors());

// Routers
const baseApiUrl = config.get<string>('baseApiUrl');
app.use(`${baseApiUrl}/transactions`, TransactionRouter);

// Run server
const port = config.get<number>('port');
const host = config.get<string>('host');
const redisUrl = config.get<string>('redisUrl');
const jobInterval = config.get<string>('jobInterval');

console.log('✨ Relayer v1');
httpServer.listen(port, host, async () => {
  await RedisService.getInstance().connect(redisUrl);
  bundleTransactionsRunner(`*/${jobInterval} * * * *`).start();
  log.info(`🚀 Server listening on port ${port}`);
});

export default app;
