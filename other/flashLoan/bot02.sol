pragma solidity =0.5.16;
// pragma solidity ^0.8.20;

import "../uniswap-v2-core/interfaces/IUniswapV2Pair.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Factory.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Callee.sol";

import "../uniswap-v2-core/UniswapV2Pair.sol";
import "../uniswap-v2-core/UniswapRouter.sol";
import "hardhat/console.sol";

import {WETH as WETH1} from "../token/WETH.sol";

import {USDT as USDT1} from "../token/USDT.sol";

// import "./USDT.sol";
// import "./WETH.sol";

contract Bot02 is IUniswapV2Callee {
    address public owner;
    address public uniswapAddress;
    address public _swap_pair;
    address public router;
    address private path1;
    address private path2;
    address private path3;
    address[] w_t_pair;
    address[] t_c_pair;

    // address[] path = new address[](3);

    constructor(address _uniswapAddress, address _router) public {
        owner = msg.sender;
        uniswapAddress = _uniswapAddress;
        router = _router;
    }

    function attack(address[] calldata path, uint256 _amount) external {
        console.log("aaa attack");
        console.log("address this:", address(this));
        console.log("attack() msg.sender:", msg.sender);

        path1 = path[0];
        path2 = path[1];
        path3 = path[2];
        w_t_pair = [path1, path2];
        (address token0, address token1) = UniswapV2Library.sortTokens(
            path[0],
            path[1]
        );
        console.log(" path address:", path[0], path[1]);

        // console.log(" amount:", amount0Out, amount1Out);

        // _swap_pair = IUniswapV2Factory(uniswapAddress).getPair(token0, token1);
        // console.log(" _swap_pair address:", _swap_pair);

        WETH1 Weth = WETH1(path1);
        Weth.mint(address(this), 500000);
        uint this_weth_balance1 = Weth.balanceOf(address(this));
        console.log("this_weth_balance:", this_weth_balance1);
        // Weth.approve(router, 99999999999999);
        Weth.approve(address(this), 99999999999999);
        console.log("-------------w swap t--------------------------");

        uint[] memory amounts = UniswapV2Library.getAmountsIn(
            uniswapAddress,
            _amount,
            w_t_pair
        );
        // uint thisbalance = IERC20(w_t_pair[0]).balanceOf(address(this));
        // console.log("thisbalance:", thisbalance);
        IERC20(w_t_pair[0]).transferFrom(
            address(this),
            // UniswapV2Library.pairFor(factory, path[0], path[1]),
            IUniswapV2Factory(uniswapAddress).getPair(path[0], path[1]),
            amounts[0]
        );
        uint256 amount0Out = path[1] == token0 ? _amount : 0;
        uint256 amount1Out = path[1] == token1 ? _amount : 0;
        IUniswapV2Pair(
            IUniswapV2Factory(uniswapAddress).getPair(token0, token1)
        ).swap(
                amount0Out,
                amount1Out,
                address(this),
                abi.encodeWithSignature("flashLoan()")
            );
        uint this_weth_balance2 = Weth.balanceOf(address(this));
        console.log("this_weth_balance:", this_weth_balance2);
    }

    function flashLoan() public {
        console.log("ccc flashLoan");
        console.log("flashLoan() address this:", address(this));
        t_c_pair = [path2, path3, path1];
        console.log("------------- t swap c--------------------------");
        console.log("address(this):", address(this));
        //给router授权
        USDT1 Usdt = USDT1(path2);
        Usdt.approve(router, 99999999999999);
        IUniswapRouter(router).swapExactTokensForTokens(
            90000,
            0,
            t_c_pair,
            address(this),
            block.timestamp + 10000
        );
        // WETH1 Weth = WETH1(weth);
        // Weth.transfer(_swap_pair, 100);
    }

    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external {
        console.log("ddd uniswapV2Call");
        flashLoan();
    }
}
