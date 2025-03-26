require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
// require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");
// require("@nomiclabs/hardhat-ethers");

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/your-api-key";
const PRIVATE_KEY0 = process.env.PRIVATE_KEY0 || "0xYourPrivateKey";
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1 || "0xYourPrivateKey";
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2 || "0xYourPrivateKey";
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "YourEtherscanAPIKey";
const COINMARKETCAP_API_KEY =
  process.env.COINMARKETCAP_API_KEY || "YourCOINMARKETCAP_API_KEY";
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.24",
      },
      {
        version: "0.8.19",
      },
      {
        version: "0.8.7",
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
          },
        },
      },
      {
        version: "0.5.16",
      },
      {
        version: "0.4.18",
      },
    ],
  },

  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY0, PRIVATE_KEY1, PRIVATE_KEY2],
      chainId: 11155111,
      blockConfirmations: 6, //等待6个区块，即当一个交易被打包到一个区块中后，需要等待该交易被后续的 6 个区块确认后
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },

  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },
  namedAccounts: {
    deployer: {
      default: 0,
      1: 0, //想让位置1的账户称为deployer
    },
  },
  gas: 2100000,
  gasPrice: 8000000000,
};
