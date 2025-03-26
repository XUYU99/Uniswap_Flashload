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
  //设置添加流动性的金额
  // const token0Amount = ethers.parseEther("100");
  // const token1Amount = ethers.parseEther("50");
  console.log(`首次添加ing......  添加 100 个kokoToken 和 50 个acToken， `);
  const FactorygetPair = await uniswapFactory.getPair(wethAddress, usdtAddress);
  console.log(`Factory getPair pair地址为: ${FactorygetPair}`);
  //开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; //当前时间+10分钟的时间戳
  const addLiquidityTx = await router
    .connect(deployer)
    .addLiquidity(
      usdcAddress,
      usdtAddress,
      100000,
      100000,
      0,
      0,
      deployer,
      deadline
    );
  await addLiquidityTx.wait();
  let ownerLq = await weth_usdt_Pair.balanceOf(deployer.address);
  console.log("owner usdc to usdt balance: ", ownerLq);
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
    wethAddress,
    usdcAddress,
    100000,
    100000000,
    0,
    0,
    deployerAddress,
    deadline
  );
  console.log(`add liquidity fin`);

  console.log("\n---------usdc swap usdt--------------------------");
  const Victim = await hre.ethers.getContractFactory("Victim");
  const victim = await Victim.deploy(usdcAddress, usdtAddress);
  const victimAddress = await victim.getAddress();
  console.log(`victimAddress : ${victimAddress}`);

  await usdc.mint(victimAddress, 900000);

  // Victims want to exchang usdc to usdt
  await victim.exchangeUsdcToUsdt(routerAddress);
  console.log(`victim fin `);
  //给 router 铸造900000的usdc币
  // await usdc.mint(routerAddress, 1000);

  // //用900000 usdc 换 usdt
  // const path = [usdcAddress, usdtAddress]; //前者是input地址，后者地址是output地址
  // console.log("swap ing......");
  // let amounts = await router
  //   .connect(deployer)
  //   .swapExactTokensForTokens(900000, 10000, path, deployerAddress, deadline);
  // console.log(`victim fin `);

  console.log("-------------攻击--------------------------");
  const path0 = [wethAddress, usdtAddress]; //前者是input地址，后者地址是output地址
  await router
    .connect(deployer)
    .swapTokensForExactTokens(90000, 9000000, path0, deployerAddress, deadline);
  const path1 = [usdtAddress, usdcAddress]; //前者是input地址，后者地址是output地址
  await router
    .connect(deployer)
    .swapExactTokensForTokens(90000, 0, path1, deployerAddress, deadline);

  const path2 = [usdcAddress, wethAddress]; //前者是input地址，后者地址是output地址
  await router
    .connect(deployer)
    .swapExactTokensForTokens(899476, 0, path2, deployerAddress, deadline);

  // const botAddress = await bot.getAddress();
  // console.log(`bot 部署在 : ${botAddress} `);
  // await usdt.approve(routerAddress, 99999999999999);
  // console.log(`approve `);
  // await bot.attack(wethUsdtPair);
  // console.log(`attack `);

  // const balance = await weth.callStatic.balanceOf(botAddress);
  // console.log(`bot balance: ${balance} `);
}
// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
