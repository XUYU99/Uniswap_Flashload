//SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract USDC is ERC20, ERC20Detailed {
    constructor() public ERC20Detailed("USDC", "USDC", 18) {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
