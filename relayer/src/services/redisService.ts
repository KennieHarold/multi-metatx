import { RedisClientType, createClient } from 'redis';
import { log } from '@/utils/logger';

class RedisService {
  private static instance: RedisService;

  client: RedisClientType | null = null;

  static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  async connect(url: string) {
    this.client = createClient({ url });
    this.client.on('error', (err) => log.error(`Redis Client Error: ${err}`));

    await this.client.connect();
    log.info('🗄️  Connected to Redis');
  }
}

export default RedisService;
