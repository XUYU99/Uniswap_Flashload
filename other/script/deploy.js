// Importing required modules and libraries from the ethers.js library.
// const { Contract, ContractFactory } = require("ethers");

const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  // 1. 从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  console.log(`使用账户部署合约: ${owner.address}`);

  // 2. 初始化一个新的 Uniswap V2 Factory 合约工厂。
  // 这个工厂需要 factoryArtifact 中的 ABI 和字节码。
  const uniswapFactory = await ethers.getContractFactory("UniswapV2Factory");

  // 3. 使用初始化的工厂部署一个新的 Factory 合约。
  // 部署是由 owner 签名的。
  const uniswapfactory = await uniswapFactory.deploy(owner.address);

  // 4. 部署后，获取新部署的 Factory 合约的地址。
  const factoryAddress = await uniswapfactory.getAddress();
  console.log(`Factory 部署在 ${factoryAddress}`);

  const TokenFactory = await ethers.getContractFactory("ERC20token", owner);

  // 6. 使用上述初始化的工厂部署 USDT 合约。
  const kokoTokenDeploy = await TokenFactory.deploy("koko", "KO");
  const acTokenDeploy = await TokenFactory.deploy("ac", "AC");

  // 7. 获取已部署的 USDT 合约的地址。
  const kokoToken = await kokoTokenDeploy.getAddress();
  console.log(`kokoToken 部署在 ${kokoToken}`);
  const acToken = await acTokenDeploy.getAddress();
  console.log(`acToken 部署在 ${acToken}`);

  //调用uniswapfactory的createPair来创造流动池
  const tx1 = await uniswapfactory.createPair(kokoToken, acToken);

  // 14. 等待交易在区块链上被确认。
  await tx1.wait();

  // 15. 从 Factory 合约中获取已创建的交易对的地址。
  const pair1Address = await uniswapfactory.getPair(kokoToken, acToken);
  console.log(`交易对部署在 ${pair1Address}`);
}
// 执行主函数
module.exports = main;
