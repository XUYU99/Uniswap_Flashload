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

  console.log("----------- deploy03 ----------------------");
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
  let balanceWETH = await weth.connect(account01).balanceOf(account1);
  console.log("account1 WETH balance: ", balanceWETH.toString());
  let balanceUSDT = await usdt.connect(account01).balanceOf(account1);
  console.log("account1 USDT balance: ", balanceUSDT.toString());
  let balanceUSDC = await usdc.connect(account01).balanceOf(account1);
  console.log("account1 USDC balance: ", balanceUSDC.toString());

  console.log("\n----笨蛋用户 用 USDC swap USDT -------");
  // 假设 account1 拥有 5000000 wei 的 USDC，并且将其授权给 routerAddress
  // mint
  const mintTx = await usdc.connect(deployer).mint(account1, 5000000);
  await mintTx.wait();

  // 授权
  const approveTx = await usdc
    .connect(account01)
    .approve(routerAddress, 9999999999999);
  await approveTx.wait();

  // 用 5000000 wei 的 USDC 兑换 USDT
  const deadline = Math.floor(Date.now() / 1000) + 10 * 60; // 当前时间加10分钟作为交易的最后期限
  const path0 = [usdcAddress, usdtAddress]; // 交易路径 USDC -> USDT
  const swapTx = await router
    .connect(account01)
    .swapExactTokensForTokens(500000, 0, path0, account1, deadline);
  await swapTx.wait();
  console.log(`笨蛋 完成换币 `); // 打印兑换完成的消息

  balanceWETH = await weth.connect(account01).balanceOf(account1);
  console.log("account1 WETH balance: ", balanceWETH.toString());
  balanceUSDT = await usdt.connect(account01).balanceOf(account1);
  console.log("account1 USDT balance: ", balanceUSDT.toString());
  balanceUSDC = await usdc.connect(account01).balanceOf(account1);
  console.log("account1 USDC balance: ", balanceUSDC.toString());
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
