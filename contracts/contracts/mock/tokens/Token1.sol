// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Token1 is ERC20, ERC20Permit {
    constructor() ERC20("Token1", "T1") ERC20Permit("Token1") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
