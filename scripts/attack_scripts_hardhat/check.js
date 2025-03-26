const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01, account02] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const account1 = await account01.getAddress();
  const account2 = await account02.getAddress();
  console.log(`owner 地址: ${deployerAddress}`);
  console.log(`account1 地址: ${account1}`);
  console.log(`account1 地址: ${account2}`);

  console.log("----------- Check ----------------------");
  //获取 uniswapFactory 和三种 token 实例
  const uniswapAddress = "0x7725F1E98825133B28f055A470E5415A1e6F6B32";
  const usdcAddress = "0xd9914A1b24B44c35B94B9AE241Fa9B477093359b";
  const usdtAddress = "0x4238ece15E12Dc9f7021eA10d9450d0D64df8D07";
  const wethAddress = "0x391Bc4Ee2c756CAB3E3a013826b5C1bAe8b3c5Bd";
  const routerAddress = "0x8323bde9c2Dfcf64a6f89b71DdBeEb079EF0e256";

  const uniswap = await ethers.getContractAt(
    "UniswapV2Factory",
    uniswapAddress
  );
  const weth = await ethers.getContractAt("WETH", wethAddress);
  const usdt = await ethers.getContractAt("USDT", usdtAddress);
  const usdc = await ethers.getContractAt("USDC", usdcAddress);
  const router = await ethers.getContractAt("UniswapRouter", routerAddress);
  console.log(`全部实例获取成功`);

  //   // 攻击后检查 bot 的 WETH 余额
  // console.log("\n--------- attack情况 ---------");
  //   const botAddress = "0x6e989C01a3e3A94C973A62280a72EC335598490e";
  //   const bot_weth_balance2 = await weth.connect(account02).balanceOf(botAddress);
  //   console.log("攻击后: bot_weth_balance:", bot_weth_balance2);

  // // 授权情况
  console.log("\n--------- 授权情况 ---------");
  const allowCount = await usdc.allowance(account2, routerAddress);
  console.log(` 授权给router数量: ${allowCount.toString()}`);

  // // balance
  console.log("\n--------- balance ---------");
  const weth_balance = await weth.balanceOf(account2);
  console.log(" weth_balance", weth_balance.toString());

  // // 流动性情况
  // console.log("\n--------- 流动性情况 ---------");
  // console.log("\n--------- usdc - usdt ---------");
  // let pairAddress = await uniswap.getPair(usdcAddress, usdtAddress);
  // let pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  // let lpTokenBalance = await pair.balanceOf(deployerAddress);
  // let reserves = await pair.getReserves();
  // console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  // console.log(
  //   `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  // );
  // let totalSupply = await pair.totalSupply();
  // console.log("首次增加流动性后 totalSupply: ", totalSupply);

  // console.log("\n--------- weth - usdt ---------");
  // pairAddress = await uniswap.getPair(wethAddress, usdtAddress);
  // pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  // lpTokenBalance = await pair.balanceOf(deployerAddress);
  // reserves = await pair.getReserves();
  // console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  // console.log(
  //   `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  // );
  // totalSupply = await pair.totalSupply();
  // console.log("首次增加流动性后 totalSupply: ", totalSupply);

  // console.log("\n--------- weth - usdc ---------");
  // pairAddress = await uniswap.getPair(wethAddress, usdcAddress);
  // pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);
  // lpTokenBalance = await pair.balanceOf(deployerAddress);
  // reserves = await pair.getReserves();
  // console.log(`部署者 LP 代币数量: ${lpTokenBalance.toString()}`);
  // console.log(
  //   `pair 储备量: ${reserves[0].toString()}, ${reserves[1].toString()}`
  // );
  // totalSupply = await pair.totalSupply();
  // console.log("首次增加流动性后 totalSupply: ", totalSupply);
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
