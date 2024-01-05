import express, { Request, Response } from 'express';
import { ethers } from 'ethers';
import { log, reportError } from '@/utils/logger';
import { AllowedNetworks, Transaction } from '@/typings/default';
import blockchain from '@config/blockchain';
import RedisService from '@/services/redisService';
import {
  validateTransactionBody,
  getContract,
  parseMetaTxValues,
  parseERC20PermitValues,
  validateMessage
} from '@/utils/functions';

const router = express.Router();

const { defaultNetwork, contract, token, eip712 } = blockchain;
const forwarderAddress = contract.address[defaultNetwork as AllowedNetworks] as string;

router.post('/', async function (req: Request<{}, {}, Transaction>, res: Response) {
  try {
    if (!validateTransactionBody(req.body)) {
      log.info(`Malformed message: Incomplete or invalid request body ${JSON.stringify(req.body)}`);
      return res.status(400).send('Malformed message');
    }

    const { metaTx, tokenPermit, targetToken } = req.body;
    const forwarder = getContract(forwarderAddress, contract.abi);
    const erc20PermitToken = getContract(targetToken.address, token.abi);
    const metaTxValues = parseMetaTxValues({ metaTx });
    const erc20PermitValues = parseERC20PermitValues({ tokenPermit });
    const metaTxNonce = Number(await forwarder.getNonce(metaTxValues.from));
    const tokenPermitNonce = Number(await erc20PermitToken.nonces(erc20PermitValues.owner));

    const erc20PermitDomain = {
      ...eip712.erc20Permit.domain,
      name: targetToken.name,
      verifyingContract: targetToken.address
    };

    const isMetaTxTypedDataValid = validateMessage({
      domain: eip712.metaTx.domain,
      types: eip712.metaTx.types,
      nonce: metaTxNonce,
      signature: metaTx.signature,
      data: metaTxValues,
      from: metaTxValues.from
    });
    const isTokenPermitTypedDataValid = validateMessage({
      domain: erc20PermitDomain,
      types: eip712.erc20Permit.types,
      nonce: tokenPermitNonce,
      signature: tokenPermit.signature,
      data: erc20PermitValues,
      from: tokenPermit.owner
    });

    if (!(isMetaTxTypedDataValid && isTokenPermitTypedDataValid)) {
      log.info(`Malformed message: TypedData not valid ${JSON.stringify(req.body)}`);
      return res.status(400).send('Malformed message');
    }

    // @dev Approve first the token with ERC20-Permit
    const permitSig = ethers.Signature.from(tokenPermit.signature);

    await erc20PermitToken.permit(
      erc20PermitValues.owner,
      await forwarder.getAddress(),
      erc20PermitValues.value,
      erc20PermitValues.deadline,
      permitSig.v,
      permitSig.r,
      permitSig.s
    );

    const redisId = `${metaTxValues.from}-${metaTxNonce.toString()}`;
    const isKeyExists = await RedisService.getInstance().client?.get(redisId);

    if (isKeyExists) {
      return res.status(400).send('You already submitted a transaction. Please wait');
    }

    const serializedBody = {
      ...metaTxValues,
      amount: metaTxValues.amount.toString(),
      signature: metaTx.signature
    };

    RedisService.getInstance().client?.set(redisId, JSON.stringify(serializedBody));
    log.info(`Successfully posted transaction with data ${JSON.stringify(req.body)}`);
    return res.status(201).send('Success!');
  } catch (error: unknown) {
    reportError(error as Error, 'Error on post transaction');
    return res.status(500).send('Internal server error');
  }
});

export const TransactionRouter = router;
