//SPDX-License-Identifier: MIT
pragma solidity >=0.5.0;

interface IUniswapV2Callee {
    // function owner() external view returns (address);

    // function usdc() external view returns (address);

    // function usdt() external view returns (address);

    // function weth() external view returns (address);

    // function weth_Usdt_Pair() external view returns (address);

    // function router() external view returns (address);

    // function attack(address _swap_pair) external;

    // function flashLoan() external;

    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external;
}
