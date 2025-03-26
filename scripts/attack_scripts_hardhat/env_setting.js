const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01] = await ethers.getSigners();
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
  console.log(`usdc Address : ${usdcAddress}`);
  console.log(`usdt Address : ${usdtAddress}`);
  console.log(`weth Address : ${wethAddress}`);

  //创建pair代币对
  await uniswapFactory.createPair(wethAddress, usdcAddress);
  await uniswapFactory.createPair(wethAddress, usdtAddress);
  await uniswapFactory.createPair(usdcAddress, usdtAddress);

  //部署 Router
  const Router = await ethers.getContractFactory("UniswapRouter");
  const router = await Router.deploy(uniswapAddress, wethAddress);
  const routerAddress = await router.getAddress();
  console.log(`router address: ${routerAddress}`);

  //铸币
  await usdc.mint(deployerAddress, 100000100000);
  await usdt.mint(deployerAddress, 100000100000);
  await weth.mint(deployerAddress, 20000000);

  console.log("\n---------添加流动性--------------------------");

  // 授权给 Router 合约，允许其操作部署者的代币
  await usdc.approve(routerAddress, 9999999999999);
  await usdt.approve(routerAddress, 9999999999999);
  await weth.approve(routerAddress, 9999999999999);

  // 开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 当前时间加10分钟作为交易的最后期限

  // USDC-USDT 交易对添加流动性
  await router.addLiquidity(
    usdcAddress,
    usdtAddress,
    100000, // 添加的USDC 数量
    100000, // 添加的USDT 数量
    0,
    0,
    deployerAddress,
    deadline
  );

  // WETH-USDT 交易对添加流动性
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

  // WETH-USDC 交易对添加流动性
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
  console.log(`add liquidity end `);

  console.log(
    "\n---------笨蛋用户 用 USDC swap USDT--------------------------"
  );
  // 假设 account1 拥有 5000000 wei 的 USDC，并且将其授权给 routerAddress
  await usdc.mint(account1, 5000000);
  await usdc.connect(account01).approve(routerAddress, 9999999999999);

  // 用 5000000 wei 的 USDC 兑换 USDT
  const path0 = [usdcAddress, usdtAddress]; // 交易路径 USDC -> USDT
  await router
    .connect(account01)
    .swapExactTokensForTokens(500000, 0, path0, account1, deadline);
  console.log(`笨蛋 完成换币 `); // 打印兑换完成的消息
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
