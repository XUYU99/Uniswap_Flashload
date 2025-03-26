const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01, account02] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const account1 = await account01.getAddress();
  const account2 = await account02.getAddress();
  //   console.log(`owner 地址: ${deployerAddress}`);
  //   console.log(`account1 地址: ${account1}`);
  //   console.log(`account2 地址: ${account2}`);

  console.log("------------ deploy01 ----------------------");
  //获取 uniswapFactory 和三种 token 实例
  const uniswapAddress = "0x84e7488422dF50677299F602Ca6845A5D47F3Bc2";
  const usdcAddress = "0x59e8321A51F2002fa3F7bB5C1E5fC64d9ccA9EA3";
  const usdtAddress = "0xD773Ab8e58E8D51F00C3B8252C14aDD0d79d662E";
  const wethAddress = "0x261c0e008B03E8aCD4Fd9Aa76684D9100E6305d4";

  //   const uniswapAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  //   const usdcAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  //   const usdtAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  //   const wethAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

  const uniswap = await ethers.getContractAt(
    "UniswapV2Factory",
    uniswapAddress
  );
  const weth = await ethers.getContractAt("WETH", wethAddress);
  const usdt = await ethers.getContractAt("USDT", usdtAddress);
  const usdc = await ethers.getContractAt("USDC", usdcAddress);
  console.log(`全部实例获取成功`);
  console.log("\n------创建pair代币对、部署 Router、铸币-------");
  //创建pair代币对
  await uniswap.createPair(wethAddress, usdcAddress);
  await uniswap.createPair(wethAddress, usdtAddress);
  await uniswap.createPair(usdcAddress, usdtAddress);

  //部署 Router
  const Router = await ethers.getContractFactory("UniswapRouter");
  const router = await Router.deploy(uniswapAddress, wethAddress);
  const routerAddress = await router.getAddress();
  console.log(`router address: ${routerAddress}`);

  //铸币
  await usdc.mint(deployerAddress, 100000100000);
  await usdt.mint(deployerAddress, 100000100000);
  await weth.mint(deployerAddress, 20000000);

  //   console.log("\n---------添加流动性--------------------------");

  //   // 授权给 Router 合约，允许其操作部署者的代币
  //   await usdc.approve(routerAddress, 9999999999999);
  //   await usdt.approve(routerAddress, 9999999999999);
  //   await weth.approve(routerAddress, 9999999999999);

  //   // 开始添加流动性
  //   const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 当前时间加10分钟作为交易的最后期限

  //   // USDC-USDT 交易对添加流动性
  //   await router.addLiquidity(
  //     usdcAddress,
  //     usdtAddress,
  //     100000, // 添加的USDC 数量
  //     100000, // 添加的USDT 数量
  //     0,
  //     0,
  //     deployerAddress,
  //     deadline
  //   );

  //   // WETH-USDT 交易对添加流动性
  //   await router.addLiquidity(
  //     wethAddress,
  //     usdtAddress,
  //     100000,
  //     100000000,
  //     0,
  //     0,
  //     deployerAddress,
  //     deadline
  //   );

  //   // WETH-USDC 交易对添加流动性
  //   await router.addLiquidity(
  //     wethAddress,
  //     usdcAddress,
  //     100000,
  //     100000000,
  //     0,
  //     0,
  //     deployerAddress,
  //     deadline
  //   );
  //   console.log(`add liquidity end `);

  //   console.log(
  //     "\n---------笨蛋用户 用 USDC swap USDT--------------------------"
  //   );
  //   // 假设 account1 拥有 5000000 wei 的 USDC，并且将其授权给 routerAddress
  //   await usdc.mint(account1, 5000000);
  //   await usdc.connect(account01).approve(routerAddress, 9999999999999);

  //   // 用 5000000 wei 的 USDC 兑换 USDT
  //   const path0 = [usdcAddress, usdtAddress]; // 交易路径 USDC -> USDT
  //   await router
  //     .connect(account01)
  //     .swapExactTokensForTokens(500000, 0, path0, account1, deadline);
  //   console.log(`笨蛋 完成换币 `); // 打印兑换完成的消息
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
