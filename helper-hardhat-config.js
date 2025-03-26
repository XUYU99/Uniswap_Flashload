const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
};
// 定义了一个 developmentChains 数组，包含了开发中使用的链名称
const developmentChains = ["hardhat", "localhost"];
// 定义了一个 DECIMALS 常量，表示代币的小数位数
const DECIMALS = 9;
// 定义了一个 INITIAL_ANSWER 常量，表示初始数值
const INITIAL_ANSWER = 200000000000;
const VOTING_DELAY = 1; // blocks
module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
  VOTING_DELAY,
};
