// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Forwarder is EIP712, Ownable {
    using ECDSA for bytes32;

    struct MetaTx {
        address from;
        address to;
        IERC20 token;
        uint256 amount;
        uint256 nonce;
    }

    struct MetaTxWithSig {
        MetaTx metaTx;
        bytes signature;
    }

    bytes32 private constant _TYPEHASH =
        keccak256("MetaTx(address from,address to,address token,uint256 amount,uint256 nonce)");

    mapping(address => uint256) private nonces;
    mapping(IERC20 => bool) private whitelistedTokens;

    constructor() EIP712("MultiMetaTx", "1") {}

    /**
     * @dev Verifies signature based on EIP712.
     * See https://eips.ethereum.org/EIPS/eip-712
     */
    function verify(MetaTx calldata _tx, bytes calldata _signature) internal view returns (bool) {
        address signer = _hashTypedDataV4(
            keccak256(abi.encode(_TYPEHASH, _tx.from, _tx.to, _tx.token, _tx.amount, _tx.nonce))
        ).recover(_signature);

        return signer == _tx.from && nonces[_tx.from] == _tx.nonce;
    }

    /// @dev Transfer bundled meta transactions in batch
    function batchTransfer(MetaTxWithSig[] calldata _metaTxWithSig, uint256 gas) external onlyOwner {
        uint256 transactionsLength = _metaTxWithSig.length;

        for (uint256 i = 0; i < transactionsLength; ++i) {
            bytes calldata signature = _metaTxWithSig[i].signature;
            MetaTx calldata metaTx = _metaTxWithSig[i].metaTx;

            if (verify(metaTx, signature) && whitelistedTokens[IERC20(metaTx.token)] && metaTx.to != address(0)) {
                nonces[metaTx.from] = nonces[metaTx.from] + 1;
                metaTx.token.transferFrom(metaTx.from, metaTx.to, metaTx.amount);
            }

            require(gasleft() > gas / 63, "Not enough gas");
        }
    }

    /**
     * @dev Whitelist a token
     * @param _token ERC20 token address
     */
    function whitelistToken(IERC20 _token) external onlyOwner {
        require(!whitelistedTokens[_token], "already whitelisted");
        whitelistedTokens[_token] = true;
    }

    /**
     * @dev Get nonce of the requester
     * @param _account Requester address
     */
    function getNonce(address _account) public view returns (uint256) {
        return nonces[_account];
    }

    // solhint-disable-next-line func-name-mixedcase
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
