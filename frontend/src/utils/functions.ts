import { Contract, JsonRpcSigner, ethers } from 'ethers';
import blockchain from './blockchain';
import { TokenContractWithInfo } from '@/typings/default';

export function getTimestampInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export async function getMetaTxSigAndValues(
  signer: JsonRpcSigner,
  contract: Contract,
  selectedToken: TokenContractWithInfo,
  amount: number,
  receiver: `0x${string}`
) {
  const domain = {
    ...blockchain.eip712.metaTx.domain
  };

  const types = {
    ...blockchain.eip712.metaTx.types
  };

  const value = String(ethers.parseEther(String(amount)));
  const nonce = Number(await contract.getNonce(signer.address));

  const values = {
    from: signer.address,
    to: receiver,
    token: selectedToken.info.address,
    amount: value,
    nonce
  };

  const signature = await signer.signTypedData(domain, types, values);

  return { ...values, signature };
}

export async function getTokenPermitSigAndValues(
  signer: JsonRpcSigner,
  contract: Contract,
  selectedToken: TokenContractWithInfo,
  amount: number
) {
  let domain = {
    ...blockchain.eip712.erc20Permit.domain,
    name: selectedToken.info.name,
    verifyingContract: selectedToken.info.address
  };

  const types = {
    ...blockchain.eip712.erc20Permit.types
  };

  const value = String(ethers.parseEther(String(amount)));
  const nonce = Number(await selectedToken.contract.nonces(signer.address));
  const deadline = getTimestampInSeconds() + 4200;

  const values = {
    owner: signer.address,
    spender: await contract.getAddress(),
    value,
    nonce,
    deadline
  };

  const signature = await signer.signTypedData(domain, types, values);
  return { ...values, signature };
}
