// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";

contract Token2 is ERC20, ERC20Permit {
    constructor() ERC20("Token2", "T2") ERC20Permit("Token2") {
        _mint(msg.sender, 1000000 * 10 ** 18);
    }
}
