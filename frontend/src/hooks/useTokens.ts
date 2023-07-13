import { useCallback, useEffect, useState } from 'react';
import { JsonRpcSigner, ethers } from 'ethers';
import { AvailableNetworks, TokenContractWithInfo } from '@/typings/default';
import blockchain from '@/utils/blockchain';

function useTokens(signer: JsonRpcSigner | null) {
  const [tokens, setTokens] = useState<TokenContractWithInfo[]>([]);

  const loadTokens = useCallback(async () => {
    if (!signer) {
      return;
    }

    const tempTokens: TokenContractWithInfo[] = [];
    const defaultNetwork = blockchain.defaultNetwork as AvailableNetworks;

    for (let tokenConfig of blockchain.token.tokens) {
      const token = new ethers.Contract(
        tokenConfig.address[defaultNetwork],
        blockchain.token.abi,
        signer
      );

      const [name, symbol, balance] = await Promise.allSettled([
        token.name(),
        token.symbol(),
        token.balanceOf(signer.address)
      ]);

      if (
        name.status === 'fulfilled' &&
        symbol.status === 'fulfilled' &&
        balance.status === 'fulfilled'
      ) {
        tempTokens.push({
          contract: token,
          info: {
            name: name.value,
            symbol: symbol.value,
            balance: parseFloat(ethers.formatEther(String(balance.value).toString())),
            address: tokenConfig.address[defaultNetwork] as `0x${string}`
          }
        });
      }
    }

    setTokens(tempTokens);
  }, [signer]);

  useEffect(() => {
    loadTokens();
  }, [loadTokens]);

  return tokens;
}

export default useTokens;
