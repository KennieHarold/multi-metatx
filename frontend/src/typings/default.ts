import { Contract } from 'ethers';

export type AvailableNetworks = 'localhost' | 'sepolia' | 'goerli';

export interface TokenContractWithInfo {
  contract: Contract;
  info: {
    name: string;
    symbol: string;
    balance: number;
    address: `0x${string}`;
  };
}
