// SPDX-License-Identifier: MIT
pragma solidity 0.5.16;

contract test01 {
    uint256 FACTOR =
        57896044618658097711785492504343953926634992332820282019728792003956564819968;

    function getHash() public view returns (bool, uint256) {
        uint256 blockValue = uint256(
            0x69363b1831c060c2c1e33f7107cd18f97a99ae64282f088081a3ffc1ad04c31f
        );
        // uint256 lastHash = blockValue;
        uint256 coinFlip = blockValue / FACTOR;
        bool side = coinFlip == 1 ? true : false;

        return (side, blockValue);
    }
}
