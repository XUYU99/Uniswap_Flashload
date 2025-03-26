pragma solidity =0.5.16;
import {USDC} from "../token/USDC.sol";
import "../uniswap-v2-core/interfaces/IUniswapRouter.sol";

contract Victim {
    address public owner;
    address public usdc;
    address public usdt;

    constructor(address _usdc, address _usdt) public {
        owner = msg.sender;
        usdc = _usdc;
        usdt = _usdt;
    }

    function exchangeUsdcToUsdt(address _router) public {
        require(msg.sender == owner);
        USDC Usdc = USDC(usdc);
        Usdc.approve(_router, 900000);
        address[] memory path = new address[](2);
        path[0] = usdc;
        path[1] = usdt;
        IUniswapRouter(_router).swapExactTokensForTokens(
            900000,
            0,
            path,
            address(this),
            block.timestamp + 10000
        );
    }
}
