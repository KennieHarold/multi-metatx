'use client';

import { useCallback, useEffect, useState } from 'react';
import MetaMaskSDK from '@metamask/sdk';
import { Contract, JsonRpcSigner, ethers } from 'ethers';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '@/components/Header';
import useTokens from '@/hooks/useTokens';
import { getMetaTxSigAndValues, getTokenPermitSigAndValues } from '@/utils/functions';
import blockchain from '@/utils/blockchain';
import { AvailableNetworks, TokenContractWithInfo } from '@/typings/default';
import TransferToken from '@/components/TransferToken';

const MMSDK = new MetaMaskSDK();
const ethereum = MMSDK.getProvider();

export default function Home() {
  const [amount, setAmount] = useState<number | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [selectedToken, setSelectedToken] = useState<TokenContractWithInfo | null>();
  const [receiver, setReceiver] = useState<`0x${string}` | null>(null);
  const tokens = useTokens(signer);

  const isSatisfiesRequirements = useCallback(() => {
    if (signer && contract && selectedToken && amount && ethers.isAddress(receiver)) {
      return true;
    }
    return false;
  }, [signer, contract, selectedToken, amount, receiver]);

  const handleSelectTokenChange = (event: any) => {
    const token = tokens.find((token) => token.info.address === event.target.value);
    setSelectedToken(token);
  };

  const handleConnect = useCallback(async () => {
    try {
      if (!ethereum) {
        return;
      }

      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      const defaultNetwork = blockchain.defaultNetwork as AvailableNetworks;
      const contract = new ethers.Contract(
        blockchain.contract.address[defaultNetwork] as string,
        blockchain.contract.abi,
        signer
      );

      setSigner(signer);
      setContract(contract);
      localStorage.setItem('metatx.connected', 'true');
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleTransfer = async () => {
    if (!(signer && contract && selectedToken && amount && ethers.isAddress(receiver))) {
      return;
    }

    try {
      const metaTx = await getMetaTxSigAndValues(signer, contract, selectedToken, amount, receiver);
      const tokenPermit = await getTokenPermitSigAndValues(signer, contract, selectedToken, amount);

      const body = {
        targetToken: {
          address: selectedToken.info.address,
          name: selectedToken.info.name
        },
        metaTx,
        tokenPermit
      };

      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (response.status === 201 && response.ok) {
        toast('Successfully submitted! 🎉 🎉', {
          type: 'success'
        });
      } else {
        toast('Error during transfer', {
          type: 'error'
        });

        throw new Error('Error on posting transaction');
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('metatx.connected') === 'true') {
      handleConnect();
    }

    return () => {
      setSigner(null);
      setContract(null);
      setSelectedToken(null);
      setReceiver(null);
    };
  }, [handleConnect]);

  useEffect(() => {
    if (tokens.length > 0) {
      setSelectedToken(tokens[0]);
    }
  }, [tokens]);

  return (
    <>
      <main className="min-h-screen min-w-full">
        <Header signer={signer} connect={handleConnect} />
        <TransferToken
          setAmount={setAmount}
          selectedToken={selectedToken}
          onSelectTokenChange={handleSelectTokenChange}
          tokens={tokens}
          amount={amount}
          receiver={receiver}
          setReceiver={setReceiver}
          isSatisfiesRequirements={isSatisfiesRequirements}
          onTransfer={handleTransfer}
        />
      </main>
      <ToastContainer theme="dark" />
    </>
  );
}
