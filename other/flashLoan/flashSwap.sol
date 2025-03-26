// SPDX-License-Identifier: MIT
pragma solidity =0.5.16;

import "../uniswap-v2-core/interfaces/IUniswapV2Pair.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Callee.sol";
import "../uniswap-v2-core/interfaces/IERC20.sol";

import "../uniswap-v2-core/UniswapV2Pair.sol";
import "../uniswap-v2-core/UniswapRouter.sol";
import "hardhat/console.sol";

import {WETH as WETH2} from "../token/WETH.sol";

// uniswap will call this function when we execute the flash swap

// 闪电互换合约
contract flashSwap is IUniswapV2Callee {
    address WETH;
    address UniswapV2Factory;

    constructor(address _WETH, address _UniswapV2Factory) public {
        WETH = _WETH;
        UniswapV2Factory = _UniswapV2Factory;
    }

    // 调用此函数来发起 Uniswap 上的闪电贷
    function testFlashSwap(address _tokenBorrow, uint256 _amount) external {
        // 检查借贷的代币和 WETH 的配对合约是否存在
        address pair = IUniswapV2Factory(UniswapV2Factory).getPair(
            _tokenBorrow,
            WETH
        );
        require(pair != address(0), "!pair");

        // 确定借贷代币在配对中是 token0 还是 token1
        address token0 = IUniswapV2Pair(pair).token0();
        address token1 = IUniswapV2Pair(pair).token1();

        // 根据借贷代币设置输出量
        uint256 amount0Out = _tokenBorrow == token0 ? _amount : 0;
        uint256 amount1Out = _tokenBorrow == token1 ? _amount : 0;

        // 编码数据以传递到 uniswapV2Call 中
        bytes memory data = abi.encode(_tokenBorrow, _amount);
        // 执行 swap 调用，最后一个参数指示是普通交换还是闪电贷
        IUniswapV2Pair(pair).swap(amount0Out, amount1Out, address(this), data);
    }

    // 接受闪电贷后，Uniswap 将调用此函数
    function uniswapV2Call(
        address _sender,
        uint256 _amount0,
        uint256 _amount1,
        bytes calldata _data
    ) external {
        console.log("flashSwap uniswapV2Call starting");
        // 确保 msg.sender 是配对合约地址
        address token0 = IUniswapV2Pair(msg.sender).token0();
        address token1 = IUniswapV2Pair(msg.sender).token1();
        address pair = IUniswapV2Factory(UniswapV2Factory).getPair(
            token0,
            token1
        );
        require(msg.sender == pair, "!pair");
        // 确保调用者是发起闪电贷的合约本身
        require(_sender == address(this), "!sender");

        // 解码传入的数据，获取借贷代币和金额
        (address tokenBorrow, uint amount) = abi.decode(_data, (address, uint));

        // 计算还款金额，包括 0.3% 的手续费
        uint fee = ((amount * 3) / 997) + 1;
        uint amountToRepay = amount + fee;
        console.log("flashSwap uniswapV2Call amountToRepay:", amountToRepay);
        // 还款给 Uniswap 池子
        IERC20(tokenBorrow).transfer(pair, amountToRepay);
    }
}
