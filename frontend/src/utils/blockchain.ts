/* eslint-disable import/no-anonymous-default-export */
export default {
  defaultNetwork: 'localhost',
  contract: {
    address: {
      localhost: process.env.NEXT_PUBLIC_FORWARDER_LOCALHOST_ADDRESS,
      sepolia: '',
      goerli: ''
    },
    gasLimit: 100000,
    abi: [
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
    tokens: [
      {
        address: {
          localhost: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
          sepolia: '',
          goerli: ''
        }
      },
      {
        address: {
          localhost: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
          sepolia: '',
          goerli: ''
        }
      },
      {
        address: {
          localhost: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
          sepolia: '',
          goerli: ''
        }
      }
    ],
    abi: [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'account',
            type: 'address'
          }
        ],
        name: 'balanceOf',
        outputs: [
          {
            internalType: 'uint256',
            name: '',
            type: 'uint256'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      },
      {
        inputs: [],
        name: 'name',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string'
          }
        ],
        stateMutability: 'view',
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
      },
      {
        inputs: [],
        name: 'symbol',
        outputs: [
          {
            internalType: 'string',
            name: '',
            type: 'string'
          }
        ],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  },
  eip712: {
    metaTx: {
      domain: {
        name: 'MultiMetaTx',
        version: '1',
        chainId: 31337,
        verifyingContract: process.env.NEXT_PUBLIC_FORWARDER_LOCALHOST_ADDRESS
      },
      types: {
        MetaTx: [
          { name: 'from', type: 'address' },
          { name: 'to', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'nonce', type: 'uint256' }
        ]
      }
    },
    erc20Permit: {
      domain: {
        name: '',
        version: '1',
        chainId: 31337,
        verifyingContract: ''
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
  }
};
