const { ethers, hre } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  const ownerAddress = owner.getAddress();
  console.log(`使用账户部署合约: ${ownerAddress}`);

  //部署三种token
  const tokenFactory = await ethers.getContractFactory("ERC20token", owner);
  const usdc = await tokenFactory.deploy("usdc", "USDC");
  const usdt = await tokenFactory.deploy("usdt", "USDT");
  const weth = await tokenFactory.deploy("weth", "WETH");
  const usdcAddress = await usdc.getAddress();
  const usdtAddress = await usdt.getAddress();
  const wethAddress = await weth.getAddress();
  console.log(`usdcAddress : ${usdcAddress}`);
  console.log(`usdtAddress : ${usdtAddress}`);
  console.log(`wethAddress : ${wethAddress}`);

  //铸币
  await usdc.mint(ownerAddress, 10000);
  await usdt.mint(ownerAddress, 10000);
  await weth.mint(ownerAddress, 2000);
  //部署uniswapFactory
  const UniswapFactory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapFactory = await UniswapFactory.deploy(ownerAddress);
  const uniswapAddress = await uniswapFactory.getAddress();
  console.log(`uniswap Factory 部署在 ${uniswapAddress}`);
  //创建pair
  await uniswapFactory.createPair(wethAddress, usdcAddress);
  await uniswapFactory.createPair(wethAddress, usdtAddress);
  const wethUsdtPair = await uniswapFactory.getPair(wethAddress, usdtAddress);
  console.log(`wethUsdtPair: ${wethUsdtPair}}`);
  //部署Router
  const Router = await ethers.getContractFactory("UniswapV2Router");
  const router = await Router.deploy(uniswapAddress, wethUsdtPair);
  const routerAddress = await router.getAddress();
  console.log(`router: ${routerAddress}`);

  //授权
  await usdc.approve(routerAddress, ethers.parseEther("1000"));
  console.log("111");
  await usdt.approve(routerAddress, ethers.parseEther("1000"));
  await weth.approve(routerAddress, ethers.parseEther("1000"));
  console.log("222");
  const token0Amount = ethers.parseEther("100");
  const token1Amount = ethers.parseEther("50");
  console.log(`首次添加ing......  添加 100 个kokoToken 和 50 个acToken， `);
  console.log(`后`);
  //开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  const addLiquidityTx = await router
    .connect(owner)
    .addLiquidity(
      wethAddress,
      usdtAddress,
      token0Amount,
      token1Amount,
      0,
      0,
      owner,
      deadline
    );
  await addLiquidityTx.wait();
}
module.exports = main;
// 执行主函数并处理可能的结果。
// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
