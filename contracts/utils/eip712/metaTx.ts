export const __TYPE__ =
  'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)';

export const baseDomain = {
  name: 'MultiMetaTx',
  version: '1',
  chainId: 31337,
  verifyingContract: ''
};

export const types = {
  MetaTx: [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
    { name: 'nonce', type: 'uint256' }
  ]
};
