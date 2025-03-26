pragma solidity =0.5.16;
import "./libraries/SafeMath.sol";
import "./UniswapV2Pair.sol";
import "hardhat/console.sol";

contract Router {
    using SafeMath for uint;
    address public _pair;
    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, "UniswapV2Router: EXPIRED");
        _;
    }

    constructor(address pair) public {
        _pair = pair;
    }

    function sortTokens(
        address tokenA,
        address tokenB
    ) internal pure returns (address token0, address token1) {
        require(tokenA != tokenB, "UniswapV2Library: IDENTICAL_ADDRESSES");
        (token0, token1) = tokenA < tokenB
            ? (tokenA, tokenB)
            : (tokenB, tokenA);
        require(token0 != address(0), "UniswapV2Library: ZERO_ADDRESS");
    }

    function getReserves(
        address tokenA,
        address tokenB
    ) internal view returns (uint reserveA, uint reserveB) {
        (address token0, ) = sortTokens(tokenA, tokenB);
        (uint reserve0, uint reserve1, ) = IUniswapV2Pair(_pair).getReserves();
        (reserveA, reserveB) = tokenA == token0
            ? (reserve0, reserve1)
            : (reserve1, reserve0);
    }

    function quote(
        uint amountA,
        uint reserveA,
        uint reserveB
    ) internal pure returns (uint amountB) {
        require(amountA > 0, "UniswapV2Library: INSUFFICIENT_AMOUNT");
        require(
            reserveA > 0 && reserveB > 0,
            "UniswapV2Library: INSUFFICIENT_LIQUIDITY"
        );
        amountB = amountA.mul(reserveB) / reserveA;
    }

    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal view returns (uint amountA, uint amountB) {
        (uint reserveA, uint reserveB) = getReserves(tokenA, tokenB);
        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                require(
                    amountBOptimal >= amountBMin,
                    "UniswapV2Router: INSUFFICIENT_B_AMOUNT"
                );
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(
                    amountAOptimal >= amountAMin,
                    "UniswapV2Router: INSUFFICIENT_A_AMOUNT"
                );
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    )
        external
        ensure(deadline)
        returns (uint amountA, uint amountB, uint liquidity)
    {
        (amountA, amountB) = _addLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        // address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
        IERC20(tokenA).transferFrom(msg.sender, _pair, amountA);
        IERC20(tokenB).transferFrom(msg.sender, _pair, amountB);
        liquidity = IUniswapV2Pair(_pair).mint(to);
    }

    //----------------------------------------swap-------------------------------------------------------
    // 指定一个确切的 输入 金额，并希望获得至少达到某个最小值的输出金额。
    function swapExactTokensForTokens(
        uint amountIn, // 输入金额
        uint amountOutMin, // 用户期望的最少输出金额
        address[] calldata path, // 交易路径
        address to, // 接收代币的地址
        uint deadline // 交易截止时间
    ) external ensure(deadline) returns (uint[] memory amounts) {
        // 获取输出金额数组，已经扣除In的手续费了
        amounts = getAmountsOut(amountIn, path);
        // console.log(
        //     "=======Router swapExactTokensForTokens amounts[0]=%d,amounts[1]=%d",
        //     amounts[0],
        //     amounts[1]
        // );
        // 检查实际的输出金额是否满足用户期望的最小值
        require(
            amounts[amounts.length - 1] >= amountOutMin,
            "UniswapV2Router: INSUFFICIENT_OUTPUT_AMOUNT"
        );
        // 将amountIn金额从调用者转入pair0地址，理解为用户支付
        IERC20(path[0]).transferFrom(msg.sender, _pair, amounts[0]); //address token, address from, address to, uint value)
        // 调用内部的 _swap 函数执行交换
        _swap(amounts, path, to);
    }

    function _swap(
        uint[] memory amounts,
        address[] memory path,
        address _to
    ) internal {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            // token地址进行排序
            (address token0, ) = sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            // 确定amountOut输出的是哪种代币
            (uint amount0Out, uint amount1Out) = input == token0
                ? (uint(0), amountOut)
                : (amountOut, uint(0));
            // console.log(
            //     "=======Router _swap amount0Out=%d,amount1Out=%d",
            //     amount0Out,
            //     amount1Out
            // );
            // 判断下一个接收地址，如果不是最后一步，则设置为下一对的地址；否则为终点地址
            address to = i < path.length - 2 ? _pair : _to;
            // 执行交换
            IUniswapV2Pair(_pair).swap(
                amount0Out,
                amount1Out,
                to,
                new bytes(0)
            );
        }
    }

    function getAmountsOut(
        uint amountIn,
        address[] memory path
    ) internal view returns (uint[] memory amounts) {
        require(path.length >= 2, "UniswapV2Library: INVALID_PATH");
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        for (uint i; i < path.length - 1; i++) {
            (uint reserveIn, uint reserveOut) = getReserves(
                path[i],
                path[i + 1]
            );
            amounts[i + 1] = getAmountOut(amounts[i], reserveIn, reserveOut);
        }
    }

    function getAmountOut(
        uint amountIn,
        uint reserveIn,
        uint reserveOut
    ) internal pure returns (uint amountOut) {
        require(amountIn > 0, "UniswapV2Library: INSUFFICIENT_INPUT_AMOUNT");
        require(
            reserveIn > 0 && reserveOut > 0,
            "UniswapV2Library: INSUFFICIENT_LIQUIDITY"
        );
        uint amountInWithFee = amountIn.mul(997);
        uint numerator = amountInWithFee.mul(reserveOut);
        uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        amountOut = numerator / denominator;
        console.log(
            "=======Router swapExactTokensForTokens amountIn=%d,amountOut=%d",
            amountIn,
            amountOut
        );
    }
}
