const { Contract, ContractFactory } = require("ethers");

const { ethers } = require("hardhat");
// const pairArtifact = require("../artifacts/contracts/uniswap-v2-core/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
// 主部署函数。
async function main() {
  // 1. 从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  console.log(`使用账户部署合约: ${owner.address}`);

  //从链上获取合约
  // const pair = await ethers.getContractAt(
  //   "UniswapV2Pair",
  //   "0xBaF2719E96099fa801f0392898FCAD8507E887f8"
  // );
  // const pairAddress = await pair.getAddress();
  // console.log(`pair address: ${pairAddress}`);

  // 16. 使用交易对的地址和 ABI 初始化一个新的交易对合约实例。
  const pairAddress = "0xBaF2719E96099fa801f0392898FCAD8507E887f8";
  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  const testaddress = await pair.connect(owner).balanceOf(owner);
  console.log("pair:", testaddress);
  // 17. 查询交易对的储备量以检查流动性。

  let name = await pair.connect(owner).name();
  console.log(`name : ${name}`);
  // console.log(`reserve0: ${reserves[0].toString()}`);
  // console.log(`reserve1: ${reserves[1].toString()}`);
}

main()
  .then(() => process.exit(0)) // 如果部署成功，退出进程。
  .catch((error) => {
    console.error(error); // 记录部署过程中遇到的任何错误。
    process.exit(1); // 以错误代码退出进程。
  });
