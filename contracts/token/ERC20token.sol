//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

contract ERC20token is ERC20, ERC20Detailed {
    constructor(
        string memory name,
        string memory symbol
    ) public ERC20Detailed(name, symbol, 18) {}

    function mint(address to, uint256 amount) public {
        // _mint(to, amount);
        _mint(to, amount * (10 ** uint256(decimals())));
    }
}
