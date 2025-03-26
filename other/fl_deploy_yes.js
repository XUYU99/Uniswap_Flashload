const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01, account02] = await ethers.getSigners();
  const account1 = account01.getAddress();
  const deployerAddress = deployer.address;
  console.log(`使用账户部署合约: ${deployer.address}`);

  //部署uniswapFactory和三种token
  const UniswapFactory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapFactory = await UniswapFactory.deploy(deployerAddress);
  const uniswapAddress = await uniswapFactory.getAddress();
  console.log(`uniswap Factory 部署在 ${uniswapAddress}`);
  const WETHFactory = await ethers.getContractFactory("WETH");
  const weth = await WETHFactory.deploy();
  const USDTFactory = await ethers.getContractFactory("USDT");
  const usdt = await USDTFactory.deploy();
  const USDCFactory = await ethers.getContractFactory("USDC");
  const usdc = await USDCFactory.deploy();
  const usdcAddress = await usdc.getAddress();
  const usdtAddress = await usdt.getAddress();
  const wethAddress = await weth.getAddress();
  console.log(`usdcAddress : ${usdcAddress}`);
  console.log(`usdtAddress : ${usdtAddress}`);
  console.log(`wethAddress : ${wethAddress}`);
  //创建pair
  await uniswapFactory.createPair(wethAddress, usdcAddress);
  await uniswapFactory.createPair(wethAddress, usdtAddress);
  await uniswapFactory.createPair(usdcAddress, usdtAddress);

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
  // let ownerLq = await weth_usdt_Pair.balanceOf(deployer.address);
  // console.log("owner usdc to usdt balance: ", ownerLq);
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

  const w_t_pair = await router.getPair(usdcAddress, usdtAddress);
  console.log("pair1:  ", w_t_pair);
  const pairTotalsupply = await router.getPairTotalsupply(w_t_pair);
  console.log("pairTotalsupply:  ", pairTotalsupply);

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

  console.log("-------------攻击--------------------------");

  // const path0 = [wethAddress, usdtAddress]; //前者是input地址，后者地址是output地址
  // await router
  //   .connect(deployer)
  //   .swapTokensForExactTokens(90000, 9000000, path0, deployerAddress, deadline);
  // const path1 = [usdtAddress, usdcAddress]; //前者是input地址，后者地址是output地址
  // await router
  //   .connect(deployer)
  //   .swapExactTokensForTokens(90000, 0, path1, deployerAddress, deadline);

  // const path2 = [usdcAddress, wethAddress]; //前者是input地址，后者地址是output地址
  // await router
  //   .connect(deployer)
  //   .swapExactTokensForTokens(899476, 0, path2, deployerAddress, deadline);
  const Bot = await ethers.getContractFactory("Bot04");
  const bot = await Bot.deploy(uniswapAddress, routerAddress);
  const botAddress = await bot.getAddress();
  console.log(`bot 部署在 : ${botAddress} `);
  await weth.mint(botAddress, 500000);
  const bot_weth_balance = await weth.balanceOf(botAddress);
  console.log("攻击前：bot_weth_balance:", bot_weth_balance);
  const path = [wethAddress, usdtAddress, usdcAddress]; //前者是input地址，后者地址是output地址

  await bot.connect(account01).attack(path, 90000);
  console.log(`attacking ...... `);
  const bot_weth_balance2 = await weth.balanceOf(botAddress);
  console.log("攻击后：bot_weth_balance:", bot_weth_balance2);
  if (bot_weth_balance2 > bot_weth_balance) {
    console.log("攻击成功！！～～～～");
  }
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
