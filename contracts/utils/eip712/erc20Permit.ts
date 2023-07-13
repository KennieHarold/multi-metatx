export const baseDomain = {
  name: '',
  version: '1',
  chainId: 31337,
  verifyingContract: ''
};

export const types = {
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
};
