export interface Transaction {
  targetToken: {
    address: string;
    name: string;
  };
  metaTx: {
    from: string;
    to: string;
    amount: bigint;
    nonce: number;
    token: string;
    signature: string;
  };
  tokenPermit: {
    owner: string;
    spender: string;
    value: bigint;
    nonce: number;
    deadline: number;
    signature: string;
  };
}

export interface Contract {
  address: {
    localhost: string;
    goerli: string;
  };
  gasLimit: number;
  abi: any[];
}

export type AllowedNetworks = 'localhost' | 'sepolia';
