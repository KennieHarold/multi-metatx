import { CronJob } from 'cron';
import RedisService from '@/services/redisService';
import blockchain from '@config/blockchain';
import { getContract } from '@/utils/functions';
import { AllowedNetworks } from '@/typings/default';
import { log, reportError } from '@/utils/logger';

const getAllKeys = async () => {
  let cursor = 0;
  let keys = [];

  do {
    let res = await RedisService.getInstance().client?.scan(cursor, { MATCH: '*', COUNT: 10 });
    cursor = res?.cursor ?? 0;
    if (res?.keys) keys.push(...res.keys);
  } while (cursor !== 0);

  return keys;
};

const bundleTransactions = async () => {
  try {
    const keys = await getAllKeys();

    if (keys.length === 0) {
      return;
    }

    const data = await RedisService.getInstance().client?.mGet(keys);

    if (typeof data === 'undefined') {
      return;
    }

    const metaTxWithSigArr = data.flatMap((item) => {
      if (!item) {
        return [];
      }

      const parsed = JSON.parse(item);
      const metaTxWithSig = {
        metaTx: { ...parsed },
        signature: parsed.signature.toString()
      };

      delete metaTxWithSig.metaTx.signature;
      return metaTxWithSig;
    });

    const { defaultNetwork, contract } = blockchain;
    const forwarderAddress = contract.address[defaultNetwork as AllowedNetworks] as string;

    const gas = blockchain.contract.gasLimit;
    const forwarder = getContract(forwarderAddress, contract.abi);
    await forwarder.batchTransfer(metaTxWithSigArr, gas);
    RedisService.getInstance().client?.flushDb();
    log.info('Successfully sent transactions!');

    // prettier-ignore
  } catch (error: any) {
    reportError(error, 'Error in bundle transactions');
  }
};

export const bundleTransactionsRunner = (pattern: string) =>
  new CronJob(pattern, bundleTransactions, null, true, 'America/Los_Angeles');
