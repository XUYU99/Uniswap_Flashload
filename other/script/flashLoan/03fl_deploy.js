const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  console.log(`使用账户部署合约: ${deployer.address}`);

  //部署uniswapFactory和三种token
  const UniswapFactory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapFactory = await UniswapFactory.deploy(deployerAddress);
  const uniswapAddress = await uniswapFactory.getAddress();
  console.log(`uniswap Factory 部署在 ${uniswapAddress}`);
  const tokenFactory = await ethers.getContractFactory("ERC20token");
  const usdc = await tokenFactory.deploy("usdc", "USDC");
  const usdt = await tokenFactory.deploy("usdt", "USDT");
  const weth = await tokenFactory.deploy("weth", "WETH");
  const usdcAddress = await usdc.getAddress();
  const usdtAddress = await usdt.getAddress();
  const wethAddress = await weth.getAddress();
  console.log(`usdcAddress : ${usdcAddress}`);
  console.log(`usdtAddress : ${usdtAddress}`);
  console.log(`wethAddress : ${wethAddress}`);
  //创建pair
  await uniswapFactory.createPair(wethAddress, usdcAddress);
  await uniswapFactory.createPair(wethAddress, usdtAddress);
  const wethUsdtPair = await uniswapFactory.getPair(wethAddress, usdtAddress);
  const weth_usdt_Pair = await ethers.getContractAt(
    "UniswapV2Pair",
    wethUsdtPair
  );
  console.log(`wethUsdtPair: ${wethUsdtPair}}`);
  //部署 Router
  const Router = await ethers.getContractFactory("UniswapRouter");
  const router = await Router.deploy(uniswapAddress, wethAddress);
  const routerAddress = await router.getAddress();
  console.log(`router: ${routerAddress}`);

  //铸币
  await usdc.mint(deployerAddress, 100000100000);
  await usdt.mint(deployerAddress, 100000100000);
  await weth.mint(deployerAddress, 20000000);

  console.log("\n---------添加流动性--------------------------");

  //授权给 Router
  await usdc.approve(routerAddress, 9999999999999);
  await usdt.approve(routerAddress, 9999999999999);
  await weth.approve(routerAddress, 9999999999999);
  const approveBalance = await usdc.allowance(deployerAddress, routerAddress);
  console.log("approveBalance:", approveBalance);
  const approveBalance1 = await usdc.allowance(deployerAddress, routerAddress);
  console.log("approveBalance1:", approveBalance1);
  //设置添加流动性的金额
  // const token0Amount = ethers.parseEther("100");
  // const token1Amount = ethers.parseEther("50");
  console.log(`首次添加ing......  添加 100 个kokoToken 和 50 个acToken， `);
  const FactorygetPair = await uniswapFactory.getPair(wethAddress, usdtAddress);
  console.log(`Factory getPair pair地址为: ${FactorygetPair}`);
  //开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  await router.addLiquidity(
    wethAddress,
    usdtAddress,
    100000,
    100000000,
    0,
    0,
    deployerAddress,
    deadline
  );
  await router.addLiquidity(
    usdcAddress,
    usdtAddress,
    100000,
    100000,
    0,
    0,
    deployer,
    deadline
  );
  await router.addLiquidity(
    wethAddress,
    usdcAddress,
    100000,
    100000000,
    0,
    0,
    deployerAddress,
    deadline
  );
  console.log("\n---------flashSwap--------------------------");
  const borrowAmount = 1000; // 1000

  const TestFlashSwapFactory = await ethers.getContractFactory("flashSwap");
  //   const TestFlashSwapContract = await TestFlashSwapFactory.deploy(
  //     usdcAddress,
  //     usdtAddress,
  //     wethAddress,
  //     routerAddress
  //   );
  const TestFlashSwapContract = await TestFlashSwapFactory.deploy(
    wethAddress,
    uniswapAddress
  );
  const flashSwapAddress = TestFlashSwapContract.getAddress();

  const fee = Math.round((borrowAmount * 3) / 997) + 1;
  await usdc.connect(deployer).transfer(flashSwapAddress, fee);
  await TestFlashSwapContract.testFlashSwap(usdcAddress, borrowAmount);
  const TestFlashSwapContractBalance = await usdc.balanceOf(flashSwapAddress);
  console.log("eq0:", TestFlashSwapContractBalance);
}
// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
