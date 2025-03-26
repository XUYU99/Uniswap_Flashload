const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [deployer, account01, account02] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const account1 = await account01.getAddress();
  const account2 = await account02.getAddress();
  // console.log(`owner 地址: ${deployerAddress}`);
  // console.log(`account1 地址: ${account1}`);
  // console.log(`account2 地址: ${account2}`);

  console.log("----------- Attack ----------------------");
  //获取 uniswapFactory 和三种 token 实例
  // const uniswapAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  // const usdcAddress = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
  // const usdtAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  // const wethAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  // const routerAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853";
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

  console.log("\n-----account02 攻击 ------");
  const Bot = await ethers.getContractFactory("arbitrageBot");
  const bot = await Bot.connect(account02).deploy(
    uniswapAddress,
    routerAddress
  );
  await bot.waitForDeployment();
  const botAddress = await bot.getAddress();
  console.log(`bot 部署在 : ${botAddress} `);

  // 给 bot 合约账户铸造 WETH 代币
  const bot_weth_balance = await weth.connect(account02).balanceOf(botAddress);
  console.log("攻击前: bot_weth_balance:", bot_weth_balance);

  // 开始套利，套利路径 WETH -> USDT -> USDC
  const path = [wethAddress, usdtAddress, usdcAddress];
  const attackTx = await bot.connect(account02).attack(path, 20000); // 使用 20000 WETH 进行套利
  await attackTx.wait();

  // 攻击后检查 bot 的 WETH 余额
  const bot_weth_balance2 = await weth.connect(account02).balanceOf(botAddress);
  console.log("攻击后: bot_weth_balance:", bot_weth_balance2);

  // 判断是否套利成功
  if (bot_weth_balance2 > bot_weth_balance) {
    console.log("攻击成功～～～");
  } else {
    console.log("攻击失败！！");
  }
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
