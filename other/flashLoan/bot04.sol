pragma solidity =0.5.16;

import "../uniswap-v2-core/interfaces/IUniswapV2Pair.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Factory.sol";
import "../uniswap-v2-core/interfaces/IUniswapRouter.sol";
import "../uniswap-v2-core/interfaces/IUniswapV2Callee.sol";

import "../uniswap-v2-core/UniswapV2Library.sol";
import "hardhat/console.sol"; // 用于调试输出
import {USDT} from "../token/USDT.sol";

// 定义一个执行套利操作的合约，继承了Uniswap V2的IUniswapV2Callee接口
contract Bot is IUniswapV2Callee {
    address public owner;
    address public uniswapAddress; // Uniswap的工厂合约地址

    address public router; // Uniswap Router合约地址
    address private weth_Address; // WETH代币地址
    address private usdt_Address; // USDT代币地址
    address private usdc_Address; // USDC代币地址
    address[] weth_usdc_Arrary; // WETH和USDT的交易对路径
    address[] usdt_usdc_weth_Arrary; // USDT、USDC和WETH的交易对路径

    // 构造函数，初始化Uniswap的地址和Router地址
    constructor(address _uniswapAddress, address _router) public {
        owner = msg.sender; // 将部署者设为合约的拥有者
        uniswapAddress = _uniswapAddress; // 初始化Uniswap的工厂合约地址
        router = _router; // 初始化Uniswap Router的合约地址
    }

    // 攻击函数，用于执行套利操作，参数为套利地址路径和打算换出多少USDT去进行套利
    //例如我们是用w swap t swap c swap w ，因此路径为path =[weth_Address,usdt_Address,usdc_Address]
    function attack(address[] calldata path, uint256 _amount) external {
        // 初始化路径的代币地址
        weth_Address = path[0]; // WETH地址
        usdt_Address = path[1]; // USDT地址
        usdc_Address = path[2]; // 其他代币地址

        weth_usdc_Arrary = [weth_Address, usdt_Address];

        console.log("先将 WETH swap USDT ......");

        // 计算需要的输入金额
        uint[] memory amounts = UniswapV2Library.getAmountsIn(
            uniswapAddress,
            _amount,
            weth_usdc_Arrary
        );
        // 通过UniswapV2Library对路径代币进行排序，确保交易顺序正确
        (address token0, address token1) = UniswapV2Library.sortTokens(
            path[0],
            path[1]
        );
        //获取 WETH 和 USDT 的Pair交易对地址
        address weth_usdt_Pair = IUniswapV2Factory(uniswapAddress).getPair(
            token0,
            token1
        );
        //将一定量的weth转入weth_usdc的交易对地址中
        IERC20(weth_Address).transfer(weth_usdt_Pair, amounts[0]);

        // 计算在Pair合约中的交易输出
        uint256 amount0Out = path[1] == token0 ? _amount : 0;
        uint256 amount1Out = path[1] == token1 ? _amount : 0;

        // 调用Pair合约的swap函数，执行套利交易，调用flashLoan函数
        IUniswapV2Pair(weth_usdt_Pair).swap(
            amount0Out,
            amount1Out,
            address(this),
            abi.encodeWithSignature("flashLoan()") // 传递flashLoan函数的调用数据
        );
    }

    // flashLoan函数，执行从 USDT 到 USDC 再换回 WETH 代币的交易
    function flashLoan() public {
        // console.log("ccc flashLoan");

        // 初始化内部交易路径，USDT -> USDC -> WETH
        usdt_usdc_weth_Arrary = [usdt_Address, usdc_Address, weth_Address];
        console.log("再 USDT swap USDC 再swap WETH ......");

        // 给router授权，允许操作bot地址的代币
        USDT Usdt = USDT(usdt_Address);
        Usdt.approve(router, 99999999999999);

        // 确定输入金额为90000wei的 USDT 代币，然后根据交易路径进行swap转换
        IUniswapRouter(router).swapExactTokensForTokens(
            90000, // 输入金额
            0, // 最低输出金额
            usdt_usdc_weth_Arrary, // 交易路径
            address(this), // 接收代币的地址
            block.timestamp + 10000 // 交易截止时间
        );
    }

    // 当执行flashLoan操作时，Uniswap会回调这个函数
    function uniswapV2Call(
        address sender,
        uint amount0,
        uint amount1,
        bytes calldata data
    ) external {
        // console.log("ddd uniswapV2Call");

        // 调用flashLoan函数完成套利交易
        flashLoan();

        // 避免编译器警告，将未使用的变量进行引用
        sender;
        amount0;
        amount1;
        data;
    }

    function test_amounts(uint initamount) external {
        // paths = [weth_Address, usdc_Address];
        // uint[] memory amounts1 = UniswapV2Library.getAmountsOut(
        //     uniswapAddress,
        //     initamount,
        //     paths
        // );
        // console.log("amount1In=%d,amount1Out=%d", amounts1[0], amounts1[1]);

        paths = [usdt_Address, usdc_Address];

        uint[] memory amounts2 = UniswapV2Library.getAmountsOut(
            uniswapAddress,
            initamount,
            paths
        );
        console.log("amount2In=%d,amount2Out=%d", amounts2[0], amounts2[1]);
        paths = [usdc_Address, weth_Address];
        uint[] memory amounts3 = UniswapV2Library.getAmountsOut(
            uniswapAddress,
            amounts2[1],
            paths
        );
        console.log("amount3In=%d,amount3Out=%d", amounts3[0], amounts3[1]);
    }
}
