const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01, account02] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  //   const account1 = await account01.getAddress();
  //   const account2 = await account02.getAddress();
  //   console.log(`owner 地址: ${deployerAddress}`);
  //   console.log(`account1 地址: ${account1}`);
  //   console.log(`account2 地址: ${account2}`);

  console.log("------------ deploy02 ----------------------");
  //获取 uniswapFactory 和三种 token 实例
  const uniswapAddress = "0x84e7488422dF50677299F602Ca6845A5D47F3Bc2";
  const usdcAddress = "0x59e8321A51F2002fa3F7bB5C1E5fC64d9ccA9EA3";
  const usdtAddress = "0xD773Ab8e58E8D51F00C3B8252C14aDD0d79d662E";
  const wethAddress = "0x261c0e008B03E8aCD4Fd9Aa76684D9100E6305d4";
  const routerAddress = "0xCA4811Eaff5F1A71E4102AEC309Faf5e17f06c4F";

  const uniswap = await ethers.getContractAt(
    "UniswapV2Factory",
    uniswapAddress
  );
  const weth = await ethers.getContractAt("WETH", wethAddress);
  const usdt = await ethers.getContractAt("USDT", usdtAddress);
  const usdc = await ethers.getContractAt("USDC", usdcAddress);
  const router = await ethers.getContractAt("UniswapRouter", routerAddress);
  console.log(`全部实例获取成功`);

  console.log("\n---------添加流动性--------------------------");

  // 授权给 Router 合约，允许其操作部署者的代币
  const approveTx1 = await usdc.approve(routerAddress, 9999999999999);
  await approveTx1.wait();
  const approveTx2 = await usdt.approve(routerAddress, 9999999999999);
  await approveTx2.wait();
  const approveTx3 = await weth.approve(routerAddress, 9999999999999);
  await approveTx3.wait();
  console.log(`approve end `);

  // 授权情况
  const allowCount = await usdc.allowance(deployerAddress, routerAddress);
  console.log(`account2 授权给router数量: ${allowCount.toString()}`);
  // 开始添加流动性
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 当前时间加10分钟作为交易的最后期限

  // USDC-USDT 交易对添加流动性
  const addLiquidityTx1 = await router.connect(deployer).addLiquidity(
    usdcAddress,
    usdtAddress,
    100000, // 添加的USDC 数量
    100000, // 添加的USDT 数量
    0,
    0,
    deployerAddress,
    deadline
  );
  await addLiquidityTx1.wait();
  // WETH-USDT 交易对添加流动性
  const addLiquidityTx2 = await router
    .connect(deployer)
    .addLiquidity(
      wethAddress,
      usdtAddress,
      100000,
      100000000,
      0,
      0,
      deployerAddress,
      deadline
    );
  await addLiquidityTx2.wait();
  // WETH-USDC 交易对添加流动性
  const addLiquidityTx3 = await router
    .connect(deployer)
    .addLiquidity(
      wethAddress,
      usdcAddress,
      100000,
      100000000,
      0,
      0,
      deployerAddress,
      deadline
    );
  await addLiquidityTx3.wait();
  console.log(`add liquidity end `);

  // 查看流动性 ，查询 LP 流动币数量和 pair 交易对的储备量
  console.log("\n--------- usdc - usdt ---------");
  let pairAddress = await uniswap.getPair(usdcAddress, usdtAddress);
  let pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  let lpTokenBalance = await pair.balanceOf(deployerAddress);
  let reserves = await pair.getReserves();
  console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  let totalSupply = await pair.totalSupply();
  console.log("首次增加流动性后 totalSupply: ", totalSupply);

  console.log("\n--------- weth - usdt ---------");
  pairAddress = await uniswap.getPair(wethAddress, usdtAddress);
  pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  lpTokenBalance = await pair.balanceOf(deployerAddress);
  reserves = await pair.getReserves();
  console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  totalSupply = await pair.totalSupply();
  console.log("首次增加流动性后 totalSupply: ", totalSupply);

  console.log("\n--------- weth - usdc ---------");
  pairAddress = await uniswap.getPair(wethAddress, usdcAddress);
  pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  lpTokenBalance = await pair.balanceOf(deployerAddress);
  reserves = await pair.getReserves();
  console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  console.log(
    `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  );
  totalSupply = await pair.totalSupply();
  console.log("首次增加流动性后 totalSupply: ", totalSupply);
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
