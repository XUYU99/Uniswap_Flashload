// Importing required modules and libraries from the ethers.js library.
const { Contract, ContractFactory } = require("ethers");

const { ethers } = require("hardhat");
const factoryArtifact = require("@uniswap/v2-core/build/UniswapV2Factory.json");
const pairArtifact = require("@uniswap/v2-periphery/build/IUniswapV2Pair.json");
// const pairArtifact = require("../artifacts/contracts/uniswap-v2-core/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json");
const routerArtifact = require("@uniswap/v2-periphery/build/UniswapV2Router02.json");
// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  console.log(`使用账户部署合约: ${owner.address}`);
  console.log("=====Factory==============================");
  //初始化uniswap工厂，并部署
  // const uniswapFactory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapFactory = new ContractFactory(
    factoryArtifact.abi,
    factoryArtifact.bytecode,
    owner
  );
  const factory = await uniswapFactory.deploy(owner.address);
  const factoryAddress = await factory.getAddress();
  console.log(`Factory 部署在 ${factoryAddress}`);

  //初始化tokenFactory, 并部署koko、ac币
  const tokenFactory = await ethers.getContractFactory("ERC20token", owner);
  const kokoToken = await tokenFactory.deploy("koko", "KO");
  const acToken = await tokenFactory.deploy("ac", "AC");
  const kokoTokenAddress = await kokoToken.getAddress();
  console.log(`kokoToken 地址是 ${kokoTokenAddress}`);
  const acTokenAddress = await acToken.getAddress();
  console.log(`acToken 地址是 ${acTokenAddress}`);

  //从链上获取kokoToken和acToken
  // const kokoToken = await ethers.getContractAt("ERC20token", kokoTokenAddress);
  // const acToken = await ethers.getContractAt("ERC20token", acTokenAddress);

  //铸造koko币、ac币
  await kokoToken.mint(owner.address, 200);
  const kokoBalance = await kokoToken.balanceOf(owner);
  await acToken.mint(owner.address, 300);
  const acBalance = await acToken.balanceOf(owner);
  // await kokoTokenDeploy.connect(owner).mint(owner.address, 100);
  // const kokoBalance = await kokoTokenDeploy.connect(owner).balanceOf(owner);
  console.log("owner kokoToken balance : ", kokoBalance);
  console.log("owner acToken balance : ", acBalance);

  //调用 uniswapfactory 的 createPair 函数来创造流动池
  const tx1 = await factory.createPair(kokoTokenAddress, acTokenAddress);
  await tx1.wait();
  // 获取pair地址
  const pairAddress = await factory.getPair(kokoTokenAddress, acTokenAddress);
  console.log(`pair 部署在 ${pairAddress}`);
  //从链上获取pair合约
  // const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  // 16. 使用交易对的地址和 ABI 初始化一个新的交易对合约实例。
  const pair = new Contract(pairAddress, pairArtifact.abi, owner);
  //查询交易对的储备量以检查流动性。
  let reserves = await pair.getReserves();
  console.log(`储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`);

  console.log("=====Router==============================");
  //部署WETH
  const WETHfactory = await ethers.getContractFactory("WETH9");
  const WETH = await WETHfactory.deploy();
  const WETHAddress = await WETH.getAddress();
  console.log(`WETH 部署在 ${WETHAddress}`);
  //部署Router

  // const Router = new ContractFactory(
  //   routerArtifact.abi,
  //   routerArtifact.bytecode,
  //   owner
  // );
  // const RouterFactory = await ethers.getContractFactory("UniswapV2Router02");
  const RouterFactory = new ContractFactory(
    routerArtifact.abi,
    routerArtifact.bytecode,
    owner
  );
  const router = await RouterFactory.deploy(pairAddress, WETHAddress);
  const routerAddress = await router.getAddress();
  console.log(`Router 部署在 ${routerAddress}`);
  // const num = await router.getNumber();
  // console.log(`num : ${num}`);

  //将代币授权给Router
  await kokoToken.approve(routerAddress, ethers.parseEther("66"));
  await acToken.approve(routerAddress, ethers.parseEther("177"));
  const value = await kokoToken.allowance(owner, routerAddress);
  console.log(`owner approve kokoToken value : ${value}`);

  //添加流动性
  const token0Amount = ethers.parseUnits("6");
  const token1Amount = ethers.parseUnits("12");

  const lpTokenBalanceBefore = await pair.balanceOf(owner);
  console.log(
    `在添加流动性之前，owner 持有的 LP 代币数量: ${lpTokenBalanceBefore.toString()}`
  );

  const deadline = Math.floor(Date.now() / 1000) + 10 * 60;
  console.log(`截止时间 deadline: ${deadline}`);

  // const factoryName = await router.factoryName(
  //   kokoTokenAddress,
  //   acTokenAddress
  // );
  // console.log(`factoryName: ${factoryName}`);

  const addLiquidityTx = await router
    .connect(owner)
    .addLiquidity(
      kokoTokenAddress,
      acTokenAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      owner,
      deadline
    );
  await addLiquidityTx.wait();
  const lpTokenBalanceAfter = await pair.balanceOf(owner);
  console.log(
    `then，owner 持有的 LP 代币数量: ${lpTokenBalanceAfter.toString()}`
  );
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0)) // 如果部署成功，退出进程。
  .catch((error) => {
    console.error(error); // 记录部署过程中遇到的任何错误。
    process.exit(1); // 以错误代码退出进程。
  });
