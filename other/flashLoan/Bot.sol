pragma solidity =0.5.16;
// pragma solidity ^0.8.20;

import "../uniswap-v2-core/interfaces/IUniswapV2Pair.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Callee.sol";

import "../uniswap-v2-core/UniswapV2Pair.sol";
import "../uniswap-v2-core/UniswapRouter.sol";
import "hardhat/console.sol";

import {WETH as WETH1} from "../token/WETH.sol";

// import "./USDT.sol";
// import "./WETH.sol";

contract Bot0 is IUniswapV2Callee {
    address public owner;
    address public usdc;
    address public usdt;
    address public weth;
    address public _swap_pair;
    address public router;
    address[] path = new address[](3);

    constructor(
        address _usdc,
        address _usdt,
        address _weth,
        address _router
    ) public {
        owner = msg.sender;
        usdc = _usdc;
        usdt = _usdt;
        weth = _weth;
        router = _router;
        path[0] = usdt;
        path[1] = usdc;
        path[2] = weth;
    }

    function attack(address weth_usdt_pair) public {
        console.log("address this:", address(this));
        console.log("aaa attack");
        require(msg.sender == owner);
        // console.log("222");
        console.log("attack() msg.sender:", msg.sender);
        _swap_pair = weth_usdt_pair;
        IUniswapV2Pair(_swap_pair).swap(
            0,
            900000,
            address(this),
            abi.encodeWithSignature("flashLoan()")
        );
    }

    function flashLoan() public {
        console.log("ccc flashLoan");
        console.log("flashLoan() address this:", address(this));
        require(msg.sender == address(this));

        // address[] memory path = new address[](3);
        // path[0] = usdt;
        // path[1] = usdc;
        // path[2] = weth;
        // USDT Usdt = USDT(usdt);
        // Usdt.approve(router, 99999999999999);
        IUniswapRouter(router).swapExactTokensForTokens(
            90000,
            0,
            path,
            address(this),
            block.timestamp + 10000
        );
        WETH1 Weth = WETH1(weth);
        Weth.transfer(_swap_pair, 100);
    }

    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external {
        console.log("bbb");
        console.log("调用了 Bot 中的 unswapV2Call 函数");
        sender.call(data);
    }
}
