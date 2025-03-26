const { ethers } = require("hardhat");

// 主部署函数。
async function main() {
  //从 ethers 提供的 signers 中获取签名者。
  const [owner] = await ethers.getSigners();
  const ownerAddress = await owner.getAddress();
  console.log(`使用账户部署合约: ${ownerAddress}`);
  console.log("\n-----------获取实例-------------------------");
  // 获取 uniswap  合约实例
  const uniswapAddress = "0xb8c424F066100c2CF2806C446Bb51Fd998E917E3";
  //   const uniswap = new ethers.Contract(uniswapAddress, uniswap.abi, owner);
  const uniswap = await ethers.getContractAt(
    "UniswapV2Factory",
    uniswapAddress
  );
  console.log(`uniswapAddress ${await uniswap.getAddress()}`);

  // 获取  kokoToken 合约实例
  const kokoTokenAddress = "0x4b89966D76477980dABF34eB1691721E9D6b9296";
  //   const router = new ethers.Contract(routerAddress, router.abi, owner);
  const kokoToken = await ethers.getContractAt("ERC20token", kokoTokenAddress);
  console.log(`kokoToken Address ${await kokoToken.getAddress()}`);
  // 获取  acToken 合约实例
  const acTokenAddress = "0x204b0F5a85CEB3B85DeB9Eb94A23962621a45e45";
  //   const router = new ethers.Contract(routerAddress, router.abi, owner);
  const acToken = await ethers.getContractAt("ERC20token", acTokenAddress);
  console.log(`acToken Address ${await acToken.getAddress()}`);

  console.log("\n-----------创建交易池对-------------------------------");
  //调用 uniswapfactory 的 createPair 函数来创造流动池
  const tx1 = await uniswap.createPair(kokoTokenAddress, acTokenAddress);
  await tx1.wait();
  // 获取pair地址
  const pairAddress = await uniswap.getPair(kokoTokenAddress, acTokenAddress);
  console.log(`pair 部署在 ${pairAddress}`);
  //从链上获取pair合约
  const pair = await ethers.getContractAt("UniswapV2Pair", pairAddress);

  console.log("------------给 account2 mint足够的代币----------------------");
  // account2的koko、ac代币数量
  let balanceKoko = await kokoToken.balanceOf(account02);
  let balanceAc = await acToken.balanceOf(account02);
  console.log(`account2 koko 代币数量: ${balanceKoko.toString()}`);
  console.log(`account2 ac 代币数量: ${balanceAc.toString()}`);

  // 给 account2 mint 200个koko、ac代币
  const mintTx1 = await kokoToken
    .connect(owner)
    .mint(account02, ethers.parseEther("20"));
  const mintTx2 = await acToken
    .connect(owner)
    .mint(account02, ethers.parseEther("20"));
  await mintTx1.wait();
  await mintTx2.wait();

  // mint后，account2的代币数量
  balanceKoko = await kokoToken.balanceOf(account02);
  balanceAc = await acToken.balanceOf(account02);
  console.log(`after mint, account2 koko 代币数量: ${balanceKoko.toString()}`);
  console.log(`after mint, account2 ac 代币数量: ${balanceAc.toString()}`);
}

// 执行主函数并处理可能的结果。
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
