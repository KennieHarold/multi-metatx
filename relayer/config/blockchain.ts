import dotenv from 'dotenv';

dotenv.config();

export default {
  defaultNetwork: 'localhost',
  eip712: {
    metaTx: {
      types: {
        MetaTx: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      },
      domain: {
        name: 'MultiMetaTx',
        version: '1',
        chainId: 31337,
        verifyingContract: process.env.FORWARDER_LOCALHOST_ADDRESS
      }
    },
    erc20Permit: {
      domain: {
        name: '',
        version: '1',
        chainId: 31337,
        verifyingContract: '0x'
      },
      types: {
        Permit: [
          {
            name: 'owner',
            type: 'address'
          },
          {
            name: 'spender',
            type: 'address'
          },
          {
            name: 'value',
            type: 'uint256'
          },
          {
            name: 'nonce',
            type: 'uint256'
          },
          {
            name: 'deadline',
            type: 'uint256'
          }
        ]
      }
    }
  },
  contract: {
    address: {
      localhost: process.env.FORWARDER_LOCALHOST_ADDRESS,
      sepolia: ''
    },
    gasLimit: 100000,
    abi: [
      {
        inputs: [
          {
            components: [
              {
                components: [
                  {
                    internalType: 'address',
                    name: 'from',
                    type: 'address'
                  },
                  {
                    internalType: 'address',
                    name: 'to',
                    type: 'address'
                  },
                  {
                    internalType: 'contract IERC20',
                    name: 'token',
                    type: 'address'
                  },
                  {
                    internalType: 'uint256',
                    name: 'amount',
                    type: 'uint256'
                  },
                  {
                    internalType: 'uint256',
                    name: 'nonce',
                    type: 'uint256'
                  }
                ],
                internalType: 'struct Forwarder.MetaTx',
                name: 'metaTx',
                type: 'tuple'
              },
              {
                internalType: 'bytes',
                name: 'signature',
                type: 'bytes'
              }
            ],
            internalType: 'struct Forwarder.MetaTxWithSig[]',
            name: '_metaTxWithSig',
            type: 'tuple[]'
          },
          {
            internalType: 'uint256',
            name: 'gas',
            type: 'uint256'
          }
        ],
        name: 'batchTransfer',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: '_account',
            type: 'address'
          }
        ],
        name: 'getNonce',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  },
  token: {
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          },
          {
            internalType: 'address',
            name: 'spender',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'value',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'deadline',
            type: 'uint256'
          },
          {
            internalType: 'uint8',
            name: 'v',
            type: 'uint8'
          },
          {
            internalType: 'bytes32',
            name: 'r',
            type: 'bytes32'
          },
          {
            internalType: 'bytes32',
            name: 's',
            type: 'bytes32'
          }
        ],
        name: 'permit',
        outputs: [],
        stateMutability: 'nonpayable',
        type: 'function'
      },
      {
        inputs: [
          {
            internalType: 'address',
            name: 'owner',
            type: 'address'
          }
        ],
        name: 'nonces',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  }
};
