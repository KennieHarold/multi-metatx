import { SignatureLike, TypedDataDomain, TypedDataField, ethers } from 'ethers';
import config from 'config';
import { Transaction } from '@/typings/default';

export function isValidAddress(address: string) {
  return ethers.isAddress(address);
}

export function validateTransactionBody(body: Transaction) {
  const { metaTx, tokenPermit, targetToken } = body;

  if (!(metaTx && tokenPermit && targetToken)) {
    return false;
  }

  if (
    typeof metaTx.signature !== 'string' ||
    typeof metaTx.amount !== 'string' ||
    typeof metaTx.nonce !== 'number' ||
    [metaTx.from, metaTx.to, metaTx.token].some((address) => !isValidAddress(address))
  ) {
    return false;
  }

  if (
    typeof tokenPermit.signature !== 'string' ||
    typeof tokenPermit.value !== 'string' ||
    typeof tokenPermit.deadline !== 'number' ||
    typeof tokenPermit.nonce !== 'number' ||
    [tokenPermit.owner, tokenPermit.spender].some((address) => !isValidAddress(address))
  ) {
    return false;
  }

  if (!isValidAddress(targetToken.address) || typeof targetToken.name !== 'string') {
    return false;
  }

  return true;
}

interface ValidateMessagePayload {
  domain: TypedDataDomain;
  types: Record<string, TypedDataField[]>;
  nonce: number;
  signature: SignatureLike;
  data: Record<string, any>;
  from: string;
}

export function validateMessage(payload: ValidateMessagePayload) {
  const { domain, types, nonce, signature, data, from } = payload;
  const signer = ethers.verifyTypedData(domain, types, data, signature);
  return nonce === data?.nonce && signer === from;
}

export function getContract(address: string, abi: any[]) {
  const privKey = config.get<string>('privKey');
  const rpcUrl = config.get<string>('rpcUrl');

  if (!privKey) {
    throw new Error('Admin PK not set');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const signer = new ethers.Wallet(privKey, provider);
  const contract = new ethers.Contract(address, abi, signer);

  return contract;
}

export function parseMetaTxValues({ metaTx }: Pick<Transaction, 'metaTx'>) {
  const parsed = {
    from: String(metaTx.from),
    to: String(metaTx.to),
    token: String(metaTx.token),
    amount: BigInt(metaTx.amount),
    nonce: Number(metaTx.nonce)
  };

  return parsed;
}

export function parseERC20PermitValues({ tokenPermit }: Pick<Transaction, 'tokenPermit'>) {
  const parsed = {
    owner: String(tokenPermit.owner),
    spender: String(tokenPermit.spender),
    value: BigInt(tokenPermit.value),
    deadline: Number(tokenPermit.deadline),
    nonce: Number(tokenPermit.nonce)
  };

  return parsed;
}
